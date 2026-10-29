"""BonnaSathi: a bilingual (Bengali / English) flood-preparedness agent for Bangladesh.

    python agent.py                     # chat
    python agent.py --session rahim     # remembers this person's conversation
    FLOOD_SIMULATE=kurigram:DANGER python agent.py   # test an alert
"""

import argparse
import re

from strands import Agent
from strands.agent.conversation_manager import SlidingWindowConversationManager
from strands.hooks import BeforeInvocationEvent, BeforeToolCallEvent, HookProvider, HookRegistry
from strands.models import BedrockModel

from flood_tools import check_flood_risk
from guidance import (detect_language, get_flood_guidance, get_national_flood_summary,
                      last_guidance, set_language)

MODEL_ID = "global.amazon.nova-2-lite-v1:0"
REGION = "us-east-1"

SYSTEM_PROMPT = """You are BonnaSathi, a flood-preparedness assistant for families and
local volunteers across all 64 districts of Bangladesh.

Rules:
- For flood risk or "what should I do" questions about a place, call get_flood_guidance.
- For questions about the whole country, a division, or "where is flooding", call
  get_national_flood_summary.
- Never guess a risk level. If you don't know the district, ask which district.
- Show tool guidance exactly as returned. Do not translate, shorten or reword it.
- You may add at most one short, calm sentence before it.
- Use check_flood_risk only when someone asks for detailed numbers.
- Every message starts with a [Reply language: ...] tag. Reply only in that language,
  and never repeat the tag in your answer.
- Never tell people they are completely safe. Floods can change quickly.
- In an emergency in Bangladesh the number is 999."""

LANGUAGE_NAMES = {"bn": "Bengali", "en": "English"}
TAG = re.compile(r"\[Reply language:[^\]]*\]\s*")


class RateLimiterHook(HookProvider):
    """Deterministic guardrail: cap each tool at max_calls per question."""

    def __init__(self, max_calls: int = 3):
        self.max_calls = max_calls
        self.counts: dict[str, int] = {}

    def register_hooks(self, registry: HookRegistry) -> None:
        registry.add_callback(BeforeInvocationEvent, self.reset)
        registry.add_callback(BeforeToolCallEvent, self.check)

    def reset(self, event: BeforeInvocationEvent) -> None:
        self.counts = {}

    def check(self, event: BeforeToolCallEvent) -> None:
        name = event.tool_use["name"]
        self.counts[name] = self.counts.get(name, 0) + 1
        if self.counts[name] > self.max_calls:
            event.cancel_tool = f"'{name}' hit the {self.max_calls}-call limit. Answer with what you have."


def build_agent(session_id=None) -> Agent:
    session_manager = None
    if session_id:
        from strands.session.file_session_manager import FileSessionManager
        session_manager = FileSessionManager(session_id=session_id, storage_dir="./sessions")
    return Agent(
        model=BedrockModel(model_id=MODEL_ID, region_name=REGION),
        tools=[get_flood_guidance, get_national_flood_summary, check_flood_risk],
        system_prompt=SYSTEM_PROMPT,
        hooks=[RateLimiterHook(max_calls=3)],
        conversation_manager=SlidingWindowConversationManager(window_size=20),
        session_manager=session_manager,
        callback_handler=None,
    )


def ask(agent: Agent, question: str) -> str:
    lang = detect_language(question)
    set_language(lang)
    name = LANGUAGE_NAMES[lang]

    reply = TAG.sub("", str(agent(f"[Reply language: {name}]\n{question}"))).strip()

    if detect_language(reply) != lang:
        reply = TAG.sub("", str(agent(
            f"[Reply language: {name}]\nYour last reply was in the wrong language. "
            f"Rewrite it fully in {name}. Keep tool guidance exactly as given."
        ))).strip()

    guidance = last_guidance()
    if guidance and guidance not in reply:
        reply = guidance

    return reply


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--session", help="remember this conversation under a name")
    args = parser.parse_args()

    agent = build_agent(args.session)
    print("BonnaSathi ready. Ask in Bengali or English about any district of Bangladesh. "
          "Type 'quit' to exit.\n")
    while True:
        question = input("You: ").strip()
        if question.lower() in {"quit", "exit"}:
            break
        if question:
            print("\nBonnaSathi:", ask(agent, question), "\n")
