import { requireAuth } from "../../middleware/auth.middleware";
import { makeMockReq, makeMockRes, mockNext } from "../helpers/supabaseMock";

const mockGetUser = jest.fn();
const mockListFactors = jest.fn();

jest.mock("../../config/supabase", () => ({
  supabase: {
    auth: { getUser: (...args: any[]) => mockGetUser(...args) },
  },
  supabaseAdmin: {
    auth: { admin: { mfa: { listFactors: (...args: any[]) => mockListFactors(...args) } } },
    from: jest.fn(),
  },
}));

// Minimal valid JWT: header.payload.signature where payload has aal = "aal1"
function makeJwt(payload: Record<string, any>) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `header.${encoded}.signature`;
}

describe("requireAuth middleware", () => {
  beforeEach(() => {
    mockNext.mockClear();
  });

  it("returns 401 when Authorization header is missing", async () => {
    const req = makeMockReq({ headers: {} });
    const res = makeMockRes();

    await requireAuth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization header does not start with Bearer", async () => {
    const req = makeMockReq({ headers: { authorization: "Basic abc123" } });
    const res = makeMockRes();

    await requireAuth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 401 when Supabase rejects the token", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("invalid") });

    const req = makeMockReq({ headers: { authorization: "Bearer bad-token" } });
    const res = makeMockRes();

    await requireAuth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid or expired token" }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 401 with mfa_required when user has MFA but token is aal1", async () => {
    const userId = "user-123";
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
    mockListFactors.mockResolvedValue({
      data: { all: [{ factor_type: "totp", status: "verified" }] },
      error: null,
    });

    const token = makeJwt({ sub: userId, aal: "aal1" });
    const req = makeMockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = makeMockRes();

    await requireAuth(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "mfa_required" }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("calls next() and sets req.user when token is valid and no MFA enrolled", async () => {
    const user = { id: "user-abc" };
    mockGetUser.mockResolvedValue({ data: { user }, error: null });
    mockListFactors.mockResolvedValue({ data: { all: [] }, error: null });

    const token = makeJwt({ sub: user.id, aal: "aal1" });
    const req = makeMockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = makeMockRes();

    await requireAuth(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toEqual(user);
  });

  it("calls next() when user has MFA and token is aal2", async () => {
    const userId = "user-mfa";
    mockGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
    mockListFactors.mockResolvedValue({
      data: { all: [{ factor_type: "totp", status: "verified" }] },
      error: null,
    });

    const token = makeJwt({ sub: userId, aal: "aal2" });
    const req = makeMockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = makeMockRes();

    await requireAuth(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
