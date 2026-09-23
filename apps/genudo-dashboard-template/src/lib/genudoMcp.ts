export interface McpRpcResponse {
  jsonrpc: string;
  id: number;
  result?: {
    content?: Array<{ type: string; text: string }>;
    isError?: boolean;
  };
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export async function callGenudoMcp<T = any>(
  toolName: string,
  args: Record<string, any> = {},
  token: string
): Promise<T> {
  const cleanToken = token.trim();
  const response = await fetch("https://api.genudo.ai/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cleanToken}`,
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      }
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid or expired GenuDo token. Please re-enter your Full Access Token.");
    }
    throw new Error(`GenuDo MCP Error (${response.status}): ${response.statusText}`);
  }

  const data: McpRpcResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "Unknown MCP RPC Error");
  }

  const textContent = data.result?.content?.[0]?.text;
  if (!textContent) {
    return {} as T;
  }

  try {
    return JSON.parse(textContent) as T;
  } catch {
    return textContent as unknown as T;
  }
}
