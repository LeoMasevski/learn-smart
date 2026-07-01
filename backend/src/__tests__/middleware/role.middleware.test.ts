import { requireRole, getUserRole } from "../../middleware/role.middleware";
import { makeBuilder, makeMockReq, makeMockRes, mockNext } from "../helpers/supabaseMock";

const mockFrom = jest.fn();

jest.mock("../../config/supabase", () => ({
  supabaseAdmin: { from: (...args: any[]) => mockFrom(...args) },
}));

describe("getUserRole", () => {
  it("returns PROFESSOR when profile has PROFESSOR role", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { role: "PROFESSOR" }, error: null }));
    const role = await getUserRole("some-user-id");
    expect(role).toBe("PROFESSOR");
  });

  it("returns STUDENT when profile has STUDENT role", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { role: "STUDENT" }, error: null }));
    const role = await getUserRole("some-user-id");
    expect(role).toBe("STUDENT");
  });

  it("returns null when profile is missing", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: null }));
    const role = await getUserRole("some-user-id");
    expect(role).toBeNull();
  });

  it("returns null when role is an unknown value", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { role: "ADMIN" }, error: null }));
    const role = await getUserRole("some-user-id");
    expect(role).toBeNull();
  });

  it("returns null on Supabase error", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("db error") }));
    const role = await getUserRole("some-user-id");
    expect(role).toBeNull();
  });
});

describe("requireRole middleware", () => {
  beforeEach(() => {
    mockNext.mockClear();
  });

  it("returns 401 when req.user is not set", async () => {
    const req = makeMockReq({ user: undefined });
    const res = makeMockRes();

    await requireRole(["PROFESSOR"])(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 403 when profile is not found", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: null }));
    const req = makeMockReq({ user: { id: "user-1" } });
    const res = makeMockRes();

    await requireRole(["PROFESSOR"])(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Profile not found" }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("returns 403 when user role is not in allowed list", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { role: "STUDENT" }, error: null }));
    const req = makeMockReq({ user: { id: "student-1" } });
    const res = makeMockRes();

    await requireRole(["PROFESSOR"])(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Forbidden: insufficient permissions" }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("calls next() and sets req.userRole when role is allowed", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { role: "PROFESSOR" }, error: null }));
    const req = makeMockReq({ user: { id: "prof-1" } });
    const res = makeMockRes();

    await requireRole(["PROFESSOR"])(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.userRole).toBe("PROFESSOR");
  });

  it("allows multiple roles", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { role: "STUDENT" }, error: null }));
    const req = makeMockReq({ user: { id: "student-2" } });
    const res = makeMockRes();

    await requireRole(["PROFESSOR", "STUDENT"])(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.userRole).toBe("STUDENT");
  });
});
