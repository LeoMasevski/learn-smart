import {
  isUserEnrolledInSubject,
  enrollUserInSubject,
  removeUserFromSubject,
  getUserSubjects,
  getSubjectStudentProgress,
} from "../../../modules/user-subjects/userSubject.service";
import { makeBuilder } from "../../helpers/supabaseMock";

const mockFrom = jest.fn();

jest.mock("../../../config/supabase", () => ({
  supabaseAdmin: { from: (...args: any[]) => mockFrom(...args) },
}));

const USER_ID = "user-1";
const SUBJECT_ID = "sub-1";

describe("isUserEnrolledInSubject", () => {
  it("returns isEnrolled: true when record found", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: { user_id: USER_ID }, error: null }));
    const { isEnrolled } = await isUserEnrolledInSubject(USER_ID, SUBJECT_ID);
    expect(isEnrolled).toBe(true);
  });

  it("returns isEnrolled: false when record is null", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: null }));
    const { isEnrolled } = await isUserEnrolledInSubject(USER_ID, SUBJECT_ID);
    expect(isEnrolled).toBe(false);
  });

  it("returns isEnrolled: false on Supabase error", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("db error") }));
    const { isEnrolled } = await isUserEnrolledInSubject(USER_ID, SUBJECT_ID);
    expect(isEnrolled).toBe(false);
  });
});

describe("enrollUserInSubject", () => {
  it("upserts and returns enrollment record", async () => {
    const enrollment = { user_id: USER_ID, subject_id: SUBJECT_ID };
    mockFrom.mockReturnValue(makeBuilder({ data: enrollment, error: null }));
    const { data, error } = await enrollUserInSubject(USER_ID, SUBJECT_ID);
    expect(data).toEqual(enrollment);
    expect(error).toBeNull();
  });
});

describe("removeUserFromSubject", () => {
  it("deletes and returns the removed enrollment", async () => {
    const enrollment = { user_id: USER_ID, subject_id: SUBJECT_ID };
    mockFrom.mockReturnValue(makeBuilder({ data: enrollment, error: null }));
    const { data, error } = await removeUserFromSubject(USER_ID, SUBJECT_ID);
    expect(data).toEqual(enrollment);
    expect(error).toBeNull();
  });

  it("returns error when not enrolled", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("not found") }));
    const { data, error } = await removeUserFromSubject(USER_ID, SUBJECT_ID);
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });
});

describe("getUserSubjects", () => {
  it("returns subjects for a user", async () => {
    const userSubjects = [{ enrolled_at: "2024-01-01", subjects: { id: SUBJECT_ID, name: "Matematika" } }];
    mockFrom.mockReturnValue(makeBuilder({ data: userSubjects, error: null }));
    const { data, error } = await getUserSubjects(USER_ID);
    expect(data).toEqual(userSubjects);
    expect(error).toBeNull();
  });
});

describe("getSubjectStudentProgress", () => {
  it("returns null on enrollment fetch error", async () => {
    mockFrom.mockReturnValue(makeBuilder({ data: null, error: new Error("db error") }));
    const { data, error } = await getSubjectStudentProgress(SUBJECT_ID);
    expect(data).toBeNull();
    expect(error).toBeTruthy();
  });

  it("aggregates student scores correctly", async () => {
    const enrolledData = [
      { enrolled_at: "2024-01-01", profiles: { id: "s-1", full_name: "Ana", learning_type: "VISUAL" } },
      { enrolled_at: "2024-01-02", profiles: { id: "s-2", full_name: "Bor", learning_type: null } },
    ];
    const quizzesData = [{ id: "q-1" }, { id: "q-2" }];
    const attemptsData = [
      { student_id: "s-1", quiz_id: "q-1", score: 80 },
      { student_id: "s-1", quiz_id: "q-2", score: 60 },
      { student_id: "s-2", quiz_id: "q-1", score: 100 },
    ];

    let call = 0;
    mockFrom.mockImplementation(() => {
      call++;
      if (call === 1) return makeBuilder({ data: enrolledData, error: null }); // enrolled students
      if (call === 2) return makeBuilder({ data: quizzesData, error: null }); // quizzes
      return makeBuilder({ data: attemptsData, error: null }); // attempts
    });

    const { data, error } = await getSubjectStudentProgress(SUBJECT_ID);
    expect(error).toBeNull();
    expect(data).toHaveLength(2);

    const ana = data!.find((s: any) => s.id === "s-1");
    expect(ana.quizzes_attempted).toBe(2);
    expect(ana.avg_score).toBe(70); // (80 + 60) / 2
    expect(ana.best_score).toBe(80);

    const bor = data!.find((s: any) => s.id === "s-2");
    expect(bor.quizzes_attempted).toBe(1);
    expect(bor.avg_score).toBe(100);
    expect(bor.best_score).toBe(100);
  });

  it("returns null avg_score and best_score for students with no attempts", async () => {
    const enrolledData = [
      { enrolled_at: "2024-01-01", profiles: { id: "s-1", full_name: "Ana", learning_type: null } },
    ];
    let call = 0;
    mockFrom.mockImplementation(() => {
      call++;
      if (call === 1) return makeBuilder({ data: enrolledData, error: null });
      if (call === 2) return makeBuilder({ data: [{ id: "q-1" }], error: null });
      return makeBuilder({ data: [], error: null }); // no attempts
    });

    const { data } = await getSubjectStudentProgress(SUBJECT_ID);
    expect(data![0].avg_score).toBeNull();
    expect(data![0].best_score).toBeNull();
    expect(data![0].quizzes_attempted).toBe(0);
  });
});
