import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpClient, type HttpError } from "../src/http/index.ts";
import { Failure } from "../src/core/result.ts";

interface Task {
  id: number;
  title: string;
}

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(data)),
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HttpClient", () => {
  it("GET returns a Success with the parsed body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ id: 1, title: "A" })));

    const result = await new HttpClient().get<Task>("/tasks/1");

    expect(result.withDefault({ id: 0, title: "" })).toEqual({ id: 1, title: "A" });
  });

  it("sends the method and JSON body for POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 2 }, 201));
    vi.stubGlobal("fetch", fetchMock);

    await new HttpClient("https://api.test").post("/tasks", { title: "New" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/tasks",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ title: "New" }) }),
    );
  });

  it("routes GET/POST/PUT/DELETE to the right verb", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}));
    vi.stubGlobal("fetch", fetchMock);
    const client = new HttpClient();

    await client.get("/a");
    await client.post("/a", {});
    await client.put("/a", {});
    await client.delete("/a");

    const methods = fetchMock.mock.calls.map((call) => (call[1] as RequestInit).method);
    expect(methods).toEqual(["GET", "POST", "PUT", "DELETE"]);
  });

  it("maps a non-2xx response to a status failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 404)));

    const result = await new HttpClient().get<Task>("/tasks/999");

    expect(result).toBeInstanceOf(Failure);
    const reason = (result as Failure<HttpError>).reason;
    expect(reason.kind).toBe("status");
    expect(reason.status).toBe(404);
  });

  it("maps a rejected fetch to a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

    const result = await new HttpClient().get("/x");

    expect((result as Failure<HttpError>).reason.kind).toBe("network");
  });

  it("maps an aborted request to a timeout failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")));

    const result = await new HttpClient().get("/x");

    expect((result as Failure<HttpError>).reason.kind).toBe("timeout");
  });
});
