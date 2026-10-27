/**
 * SIMULATED quiz generation. Draws practice questions from the sample bank for the resource's
 * topic and shuffles questions and options. It does not read the resource's content. Replace
 * `generateQuiz` with an AI quiz service; the quiz UI only depends on the `Quiz` type.
 */
import { quizBank, type BankQuestion } from "@/mock/sources/quiz-bank";
import type { LearningResource, QuizTopic } from "@/mock/sources/resources";

export type QuizQuestion = Omit<BankQuestion, "options"> & {
  options: string[];
};

export type Quiz = {
  id: string;
  topic: QuizTopic;
  questions: QuizQuestion[];
};

export const QUESTION_COUNTS = [5, 10, 15] as const;
const SIMULATED_LATENCY_MS = 1100;

export const availableQuestions = (topic: QuizTopic) => quizBank[topic].length;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function generateQuiz(
  resource: LearningResource,
  count: number,
  signal?: AbortSignal,
): Promise<Quiz> {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, SIMULATED_LATENCY_MS);
    signal?.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(signal.reason);
    });
  });

  const questions = shuffle(quizBank[resource.quizTopic])
    .slice(0, count)
    .map((question) => {
      // Shuffle options too, keeping track of where the correct one lands.
      const order = shuffle([0, 1, 2, 3]);
      return {
        ...question,
        options: order.map((index) => question.options[index]),
        answer: order.indexOf(question.answer),
      };
    });

  return { id: crypto.randomUUID(), topic: resource.quizTopic, questions };
}

export function scoreQuiz(quiz: Quiz, answers: Record<string, number>) {
  const correct = quiz.questions.filter(
    (question) => answers[question.id] === question.answer,
  ).length;
  return {
    correct,
    total: quiz.questions.length,
    percent: Math.round((correct / quiz.questions.length) * 100),
  };
}
