import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../modules/subjects/subject.service";
import { makeBuilder } from "../../helpers/supabaseMock";

const mockFrom = jest.fn();

jest.mock("../../../config/supabase", () => ({
  supabaseAdmin: { from: (...args: any[]) => mockFrom(...args) },
}));

const subjectFixture = { id: "sub-1", name: "Matematika", description: "Osnove", created_at: "2024-01-01", updated_at: "2024-01-01" };

describe("getAllSubjects", () => {
  it("returns list of subjects", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: [subjectFixture], error: null }));
    const { data, error } = await getAllSubjects();
    expect(data).toEqual([subjectFixture]);
    expect(error).toBeNull();
  });

  it("propagates Supabase errors", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("db error") }));
    const { data, error } = await getAllSubjects();
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});

describe("getSubjectById", () => {
  it("returns a subject when found", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: subjectFixture, error: null }));
    const { data, error } = await getSubjectById("sub-1");
    expect(data).toEqual(subjectFixture);
    expect(error).toBeNull();
  });

  it("returns error when not found", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("not found") }));
    const { data, error } = await getSubjectById("non-existent");
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});

describe("createSubject", () => {
  it("inserts and returns new subject", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: subjectFixture, error: null }));
    const { data, error } = await createSubject("Matematika", "Osnove");
    expect(data).toEqual(subjectFixture);
    expect(error).toBeNull();
  });

  it("works without description", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { ...subjectFixture, description: undefined }, error: null }));
    const { data } = await createSubject("Matematika");
    expect(data?.name).toBe("Matematika");
  });
});

describe("updateSubject", () => {
  it("updates name and description", async () => {
    const updated = { ...subjectFixture, name: "Fizika" };
    mockFrom.mockReturnValue(makeBuilder({ data: updated, error: null }));
    const { data, error } = await updateSubject("sub-1", "Fizika", "Nova");
    expect(data).toEqual(updated);
    expect(error).toBeNull();
  });

  it("returns error on failure", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("db error") }));
    const { error } = await updateSubject("bad-id");
    expect(error).toBeTruthy();
  });
});

describe("deleteSubject", () => {
  it("deletes and returns the deleted subject", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: subjectFixture, error: null }));
    const { data, error } = await deleteSubject("sub-1");
    expect(data).toEqual(subjectFixture);
    expect(error).toBeNull();
  });

  it("returns error when subject does not exist", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("not found") }));
    const { data, error } = await deleteSubject("non-existent");
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});
