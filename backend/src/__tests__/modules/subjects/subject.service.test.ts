import {
  getAllSubjects,
  getSubjectsByProfessorId,
  getSubjectById,
  getSubjectByIdForProfessor,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../../modules/subjects/subject.service";
import { makeBuilder } from "../../helpers/supabaseMock";

const mockFrom = jest.fn();

jest.mock("../../../config/supabase", () => ({
  supabaseAdmin: { from: (...args: any[]) => mockFrom(...args) },
}));

const subjectFixture = {
  id: "sub-1",
  created_by: "prof-1",
  name: "Matematika",
  description: "Osnove",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

beforeEach(() => {
  mockFrom.mockReset();
});

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

describe("getSubjectsByProfessorId", () => {
  it("filters subjects by professor owner", async () => {
    const builder = makeBuilder({ data: [subjectFixture], error: null });
    mockFrom.mockReturnValue(builder);

    const { data, error } = await getSubjectsByProfessorId("prof-1");

    expect(data).toEqual([subjectFixture]);
    expect(error).toBeNull();
    expect(builder.eq).toHaveBeenCalledWith("created_by", "prof-1");
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

describe("getSubjectByIdForProfessor", () => {
  it("filters subject by id and professor owner", async () => {
    const builder = makeBuilder({ data: subjectFixture, error: null });
    mockFrom.mockReturnValue(builder);

    const { data, error } = await getSubjectByIdForProfessor("sub-1", "prof-1");

    expect(data).toEqual(subjectFixture);
    expect(error).toBeNull();
    expect(builder.eq).toHaveBeenCalledWith("id", "sub-1");
    expect(builder.eq).toHaveBeenCalledWith("created_by", "prof-1");
  });
});

describe("createSubject", () => {
  it("inserts and returns new subject", async () => {
    const builder = makeBuilder({ data: subjectFixture, error: null });
    mockFrom.mockReturnValue(builder);

    const { data, error } = await createSubject("Matematika", "prof-1", "Osnove");

    expect(data).toEqual(subjectFixture);
    expect(error).toBeNull();
    expect(builder.insert).toHaveBeenCalledWith({
      name: "Matematika",
      created_by: "prof-1",
      description: "Osnove",
    });
  });

  it("works without description", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { ...subjectFixture, description: undefined }, error: null }));
    const { data } = await createSubject("Matematika", "prof-1");
    expect(data?.name).toBe("Matematika");
  });
});

describe("updateSubject", () => {
  it("updates name and description", async () => {
    const updated = { ...subjectFixture, name: "Fizika" };
    const builder = makeBuilder({ data: updated, error: null });
    mockFrom.mockReturnValue(builder);

    const { data, error } = await updateSubject("sub-1", "prof-1", "Fizika", "Nova");

    expect(data).toEqual(updated);
    expect(error).toBeNull();
    expect(builder.eq).toHaveBeenCalledWith("id", "sub-1");
    expect(builder.eq).toHaveBeenCalledWith("created_by", "prof-1");
  });

  it("returns error on failure", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("db error") }));
    const { error } = await updateSubject("bad-id", "prof-1");
    expect(error).toBeTruthy();
  });
});

describe("deleteSubject", () => {
  it("deletes and returns the deleted subject", async () => {
    const builder = makeBuilder({ data: subjectFixture, error: null });
    mockFrom.mockReturnValue(builder);

    const { data, error } = await deleteSubject("sub-1", "prof-1");

    expect(data).toEqual(subjectFixture);
    expect(error).toBeNull();
    expect(builder.eq).toHaveBeenCalledWith("id", "sub-1");
    expect(builder.eq).toHaveBeenCalledWith("created_by", "prof-1");
  });

  it("returns error when subject does not exist", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("not found") }));
    const { data, error } = await deleteSubject("non-existent", "prof-1");
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});
