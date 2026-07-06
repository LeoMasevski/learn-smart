import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import lessonRoutes from "../modules/lessons/lesson.routes";
import quizRoutes from "../modules/quizzes/quiz.routes";
import dashboardRoutes from "../modules/dashboards/dashboard.routes";
import subjectRoutes from "../modules/subjects/subject.routes";
import userSubjectRoutes from "../modules/user-subjects/userSubject.routes";
import subjectQuizRoutes from "../modules/subject-quizzes/subjectQuiz.routes";
import quizAttemptRoutes from "../modules/quiz-attempts/quizAttempt.routes";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    message: "LearnSmart API",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/lessons", lessonRoutes);
router.use("/quizzes", quizRoutes);
router.use("/subject-quizzes", subjectQuizRoutes);
router.use("/quiz-attempts", quizAttemptRoutes);
router.use("/dashboards", dashboardRoutes);
router.use("/subjects", subjectRoutes);
router.use("/user-subjects", userSubjectRoutes);

export default router;