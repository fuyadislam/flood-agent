"""Amazon Bedrock AgentCore Runtime entrypoint.

Payload: {"prompt": "Is Kurigram at risk?"}
"""

from bedrock_agentcore.runtime import BedrockAgentCoreApp

from agent import ask, build_agent

app = BedrockAgentCoreApp()
_agent = None


@app.entrypoint
def invoke(payload, context):
    global _agent
    prompt = (payload or {}).get("prompt")
    if not prompt:
        raise ValueError("Missing required field: prompt")
    if _agent is None:
        _agent = build_agent()
    return {"response": ask(_agent, prompt)}


if __name__ == "__main__":
    app.run()
