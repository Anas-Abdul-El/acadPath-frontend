/**
 * Sample practice questions, grouped by topic. Quizzes draw from these banks — they are NOT
 * generated from a resource's actual content. Replace with an AI quiz service later.
 */
import type { QuizTopic } from "@/mock/sources/resources"

export type BankQuestion = {
  id: string
  prompt: string
  /** Exactly four options. */
  options: [string, string, string, string]
  /** Index of the correct option. */
  answer: number
  explanation: string
}

export const QUIZ_TOPIC_LABEL: Record<QuizTopic, string> = {
  "discrete-math": "Discrete mathematics",
  algorithms: "Algorithms",
  probability: "Probability & statistics",
  "linear-algebra": "Linear algebra",
  databases: "Databases",
  "operating-systems": "Operating systems",
  networks: "Computer networks",
  "machine-learning": "Machine learning",
}

export const quizBank: Record<QuizTopic, BankQuestion[]> = {
  "discrete-math": [
    { id: "dm1", prompt: "Which statement is logically equivalent to “if P then Q”?", options: ["If Q then P", "If not P then not Q", "If not Q then not P", "P and not Q"], answer: 2, explanation: "An implication is equivalent to its contrapositive: ¬Q → ¬P. The converse (Q → P) and inverse (¬P → ¬Q) are not equivalent." },
    { id: "dm2", prompt: "How many subsets does a set with 5 elements have?", options: ["5", "10", "25", "32"], answer: 3, explanation: "Each element is either in or out of a subset, giving 2⁵ = 32 subsets (including the empty set and the set itself)." },
    { id: "dm3", prompt: "What is the negation of “every student passed”?", options: ["No student passed", "Some student did not pass", "Every student failed", "Some student passed"], answer: 1, explanation: "¬∀x P(x) is equivalent to ∃x ¬P(x): at least one student did not pass." },
    { id: "dm4", prompt: "In a proof by induction, what does the inductive step show?", options: ["The statement holds for n = 1", "If it holds for n = k, it holds for n = k + 1", "It holds for all n by checking examples", "The statement is false for some n"], answer: 1, explanation: "The base case covers the start; the inductive step shows truth for k implies truth for k + 1." },
    { id: "dm5", prompt: "How many ways can you choose 2 students from a group of 6 (order doesn't matter)?", options: ["12", "15", "30", "36"], answer: 1, explanation: "C(6, 2) = 6! / (2! · 4!) = 15." },
    { id: "dm6", prompt: "A relation that is reflexive, symmetric, and transitive is called…", options: ["A partial order", "A function", "An equivalence relation", "A total order"], answer: 2, explanation: "Equivalence relations have all three properties and partition a set into equivalence classes." },
    { id: "dm7", prompt: "What is the sum of the degrees of all vertices in a graph with 7 edges?", options: ["7", "14", "21", "It depends on the graph"], answer: 1, explanation: "By the handshake lemma, every edge contributes 2 to the total degree: 2 × 7 = 14." },
    { id: "dm8", prompt: "Which of these is a tautology?", options: ["P ∧ ¬P", "P ∨ ¬P", "P → ¬P", "¬P"], answer: 1, explanation: "P ∨ ¬P is true for every truth value of P (the law of the excluded middle)." },
    { id: "dm9", prompt: "How many arrangements of the letters in “CODE” are there?", options: ["12", "16", "24", "256"], answer: 2, explanation: "Four distinct letters can be arranged in 4! = 24 ways." },
    { id: "dm10", prompt: "If 13 people are in a room, at least two share a birth month. Which principle is this?", options: ["Inclusion–exclusion", "The pigeonhole principle", "Induction", "The binomial theorem"], answer: 1, explanation: "13 people into 12 months means some month holds at least two people — the pigeonhole principle." },
    { id: "dm11", prompt: "A function f: A → B is a bijection when it is…", options: ["Only injective", "Only surjective", "Both injective and surjective", "Defined on every element of B"], answer: 2, explanation: "A bijection is one-to-one (injective) and onto (surjective), so it has an inverse." },
    { id: "dm12", prompt: "|A ∪ B| equals…", options: ["|A| + |B|", "|A| + |B| − |A ∩ B|", "|A| · |B|", "|A ∩ B|"], answer: 1, explanation: "Inclusion–exclusion: adding |A| and |B| counts the intersection twice, so subtract it once." },
    { id: "dm13", prompt: "A tree with 10 vertices has how many edges?", options: ["9", "10", "11", "45"], answer: 0, explanation: "Every tree with n vertices has exactly n − 1 edges." },
    { id: "dm14", prompt: "What does a proof by contradiction assume?", options: ["The statement is true", "The negation of the statement", "The converse of the statement", "A smaller case of the statement"], answer: 1, explanation: "You assume the statement is false and derive a contradiction, so the statement must be true." },
    { id: "dm15", prompt: "Which value of n makes the statement “n² > 2n” false?", options: ["n = 3", "n = 4", "n = 2", "n = 5"], answer: 2, explanation: "For n = 2: 4 > 4 is false. For n ≥ 3 it holds." },
  ],
  algorithms: [
    { id: "al1", prompt: "What is the worst-case time complexity of binary search on a sorted array of n elements?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 1, explanation: "Each step halves the search range, so at most about log₂ n comparisons are needed." },
    { id: "al2", prompt: "Which sorting algorithm has O(n log n) worst-case time?", options: ["Quicksort", "Insertion sort", "Merge sort", "Bubble sort"], answer: 2, explanation: "Merge sort always splits evenly and merges in linear time. Quicksort can degrade to O(n²)." },
    { id: "al3", prompt: "Dynamic programming is most useful when a problem has…", options: ["No subproblems", "Overlapping subproblems and optimal substructure", "Only a greedy choice", "Random inputs"], answer: 1, explanation: "DP stores solutions to overlapping subproblems and combines them into an optimal solution." },
    { id: "al4", prompt: "What does the Master Theorem give for T(n) = 2T(n/2) + O(n)?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], answer: 1, explanation: "a = 2, b = 2, f(n) = n = n^(log_b a), which is case 2: Θ(n log n)." },
    { id: "al5", prompt: "Dijkstra's algorithm can give wrong answers when the graph has…", options: ["Cycles", "Negative edge weights", "More than 100 vertices", "Undirected edges"], answer: 1, explanation: "Dijkstra assumes a settled distance never decreases, which negative edges can violate. Bellman–Ford handles them." },
    { id: "al6", prompt: "Breadth-first search finds shortest paths in…", options: ["Weighted graphs", "Unweighted graphs", "Only trees", "Graphs with negative weights"], answer: 1, explanation: "BFS explores by number of edges, so it finds fewest-edge paths in unweighted graphs." },
    { id: "al7", prompt: "Which data structure gives O(log n) insert and extract-min?", options: ["Sorted array", "Binary heap", "Linked list", "Hash table"], answer: 1, explanation: "A binary heap supports both operations in O(log n) by sifting up or down." },
    { id: "al8", prompt: "A greedy algorithm is guaranteed optimal when the problem has…", options: ["The greedy-choice property and optimal substructure", "Overlapping subproblems only", "Exponentially many solutions", "A unique solution"], answer: 0, explanation: "Greedy works when a locally optimal choice can always be extended to a globally optimal solution." },
    { id: "al9", prompt: "What is the time complexity of building a heap from n elements bottom-up?", options: ["O(n)", "O(n log n)", "O(log n)", "O(n²)"], answer: 0, explanation: "Most nodes are near the leaves and sift down only a little; the total work sums to O(n)." },
    { id: "al10", prompt: "If a problem is NP-complete, then…", options: ["It can't be solved at all", "It's in NP and every NP problem reduces to it", "It has a known polynomial algorithm", "It's easier than every problem in P"], answer: 1, explanation: "NP-complete problems are in NP and NP-hard. No polynomial algorithm is known for them." },
    { id: "al11", prompt: "Topological sorting applies to…", options: ["Any undirected graph", "Directed acyclic graphs", "Weighted complete graphs", "Graphs with negative cycles"], answer: 1, explanation: "A topological order exists only if the directed graph has no cycles." },
    { id: "al12", prompt: "What is the average-case lookup time in a well-sized hash table?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], answer: 0, explanation: "With a good hash function and load factor, lookups take constant time on average." },
    { id: "al13", prompt: "Kruskal's algorithm finds…", options: ["Shortest paths from one source", "A minimum spanning tree", "A maximum flow", "A topological order"], answer: 1, explanation: "Kruskal adds the cheapest edge that doesn't form a cycle until all vertices are connected." },
    { id: "al14", prompt: "The 0/1 knapsack DP with n items and capacity W runs in…", options: ["O(n)", "O(nW)", "O(2ⁿ)", "O(W log n)"], answer: 1, explanation: "The table has n × W entries, each filled in constant time — pseudo-polynomial time." },
    { id: "al15", prompt: "Which is true of the lower bound for comparison-based sorting?", options: ["Ω(n)", "Ω(n log n)", "Ω(log n)", "Ω(n²)"], answer: 1, explanation: "A decision tree must distinguish n! orderings, needing at least log₂(n!) = Ω(n log n) comparisons." },
  ],
  probability: [
    { id: "pr1", prompt: "Two fair dice are rolled. What is the probability their sum is 7?", options: ["1/12", "1/6", "1/36", "7/36"], answer: 1, explanation: "6 of the 36 equally likely outcomes sum to 7: 6/36 = 1/6." },
    { id: "pr2", prompt: "Events A and B are independent when…", options: ["P(A ∩ B) = 0", "P(A ∩ B) = P(A) · P(B)", "P(A) = P(B)", "P(A ∪ B) = 1"], answer: 1, explanation: "Independence means knowing one happened doesn't change the other's probability, so the joint probability factors." },
    { id: "pr3", prompt: "The expected value of a fair six-sided die roll is…", options: ["3", "3.5", "4", "6"], answer: 1, explanation: "(1 + 2 + 3 + 4 + 5 + 6) / 6 = 21 / 6 = 3.5." },
    { id: "pr4", prompt: "Bayes' theorem lets you compute…", options: ["P(A | B) from P(B | A), P(A), and P(B)", "The mean of a sample", "The variance of a sum", "A confidence interval"], answer: 0, explanation: "P(A | B) = P(B | A) · P(A) / P(B) reverses the direction of conditioning." },
    { id: "pr5", prompt: "For a normal distribution, about what share of values lie within one standard deviation of the mean?", options: ["50%", "68%", "95%", "99.7%"], answer: 1, explanation: "The 68–95–99.7 rule: about 68% within 1σ, 95% within 2σ, 99.7% within 3σ." },
    { id: "pr6", prompt: "A p-value of 0.03 with α = 0.05 means you should…", options: ["Accept the null hypothesis", "Reject the null hypothesis", "Increase the sample size", "Reject the alternative hypothesis"], answer: 1, explanation: "p < α, so the result is statistically significant at the 5% level and you reject H₀." },
    { id: "pr7", prompt: "The number of successes in 10 independent trials with success probability 0.3 follows…", options: ["A Poisson distribution", "A binomial distribution", "A uniform distribution", "An exponential distribution"], answer: 1, explanation: "A fixed number of independent yes/no trials with the same probability is binomial(n = 10, p = 0.3)." },
    { id: "pr8", prompt: "Var(aX + b) equals…", options: ["a · Var(X) + b", "a² · Var(X)", "a² · Var(X) + b", "Var(X)"], answer: 1, explanation: "Adding a constant doesn't change spread; scaling by a multiplies variance by a²." },
    { id: "pr9", prompt: "The Central Limit Theorem says that for large samples…", options: ["The data become normally distributed", "The sample mean is approximately normally distributed", "The variance goes to zero", "Every distribution is symmetric"], answer: 1, explanation: "The sampling distribution of the mean approaches normal, whatever the population's shape (with finite variance)." },
    { id: "pr10", prompt: "A Type I error is…", options: ["Failing to reject a false null", "Rejecting a true null", "Using the wrong test", "A sampling bias"], answer: 1, explanation: "Type I is a false positive (rejecting H₀ when it's true); its probability is α." },
    { id: "pr11", prompt: "If P(A) = 0.4 and P(B | A) = 0.5, what is P(A ∩ B)?", options: ["0.1", "0.2", "0.45", "0.9"], answer: 1, explanation: "P(A ∩ B) = P(A) · P(B | A) = 0.4 × 0.5 = 0.2." },
    { id: "pr12", prompt: "The mean of an exponential distribution with rate λ = 2 is…", options: ["0.5", "1", "2", "4"], answer: 0, explanation: "For an exponential distribution, the mean is 1/λ = 1/2." },
    { id: "pr13", prompt: "A 95% confidence interval means…", options: ["There's a 95% chance the sample mean is in it", "95% of such intervals would contain the true parameter", "95% of the data lie inside it", "The estimate is 95% accurate"], answer: 1, explanation: "Confidence describes the procedure: over repeated samples, 95% of intervals built this way cover the true value." },
    { id: "pr14", prompt: "The correlation coefficient r = −0.9 indicates…", options: ["No relationship", "A weak positive relationship", "A strong negative linear relationship", "Causation"], answer: 2, explanation: "|r| near 1 is strong; the sign gives direction. Correlation alone never shows causation." },
    { id: "pr15", prompt: "E[X + Y] equals E[X] + E[Y]…", options: ["Only if X and Y are independent", "Always", "Only for normal variables", "Never"], answer: 1, explanation: "Linearity of expectation holds for any random variables, independent or not." },
  ],
  "linear-algebra": [
    { id: "la1", prompt: "A square matrix is invertible exactly when its determinant is…", options: ["0", "1", "Nonzero", "Positive"], answer: 2, explanation: "det(A) ≠ 0 means the columns are independent and the transformation can be undone." },
    { id: "la2", prompt: "If Av = λv for a nonzero vector v, then v is…", options: ["A basis vector", "An eigenvector of A", "In the null space of A", "Orthogonal to A"], answer: 1, explanation: "v keeps its direction under A and is only scaled by λ, its eigenvalue." },
    { id: "la3", prompt: "The rank of a matrix is…", options: ["The number of rows", "The dimension of its column space", "The number of zero entries", "Its largest eigenvalue"], answer: 1, explanation: "Rank counts linearly independent columns (equivalently, rows)." },
    { id: "la4", prompt: "What is the product of a 2×3 matrix and a 3×4 matrix?", options: ["A 2×4 matrix", "A 3×3 matrix", "A 4×2 matrix", "It's undefined"], answer: 0, explanation: "Inner dimensions match (3), and the result takes the outer dimensions: 2×4." },
    { id: "la5", prompt: "Two vectors are orthogonal when their dot product is…", options: ["1", "−1", "0", "Equal to their lengths"], answer: 2, explanation: "u · v = |u||v|cos θ is 0 exactly when θ = 90°." },
    { id: "la6", prompt: "For an n×n matrix A, rank(A) + nullity(A) equals…", options: ["0", "n", "2n", "det(A)"], answer: 1, explanation: "The rank–nullity theorem: rank plus nullity equals the number of columns." },
    { id: "la7", prompt: "(AB)ᵀ equals…", options: ["AᵀBᵀ", "BᵀAᵀ", "BA", "(BA)ᵀ"], answer: 1, explanation: "Transposing a product reverses the order: (AB)ᵀ = BᵀAᵀ." },
    { id: "la8", prompt: "A set of vectors is linearly independent when…", options: ["They all have length 1", "No vector is a combination of the others", "They're orthogonal", "There are fewer than three of them"], answer: 1, explanation: "Only the trivial combination of them gives the zero vector." },
    { id: "la9", prompt: "The determinant of [[2, 0], [0, 3]] is…", options: ["5", "6", "0", "1"], answer: 1, explanation: "For a diagonal matrix, the determinant is the product of the diagonal: 2 × 3 = 6." },
    { id: "la10", prompt: "Geometrically, the determinant of a 2×2 matrix measures…", options: ["The length of the first column", "How the transformation scales area", "The angle between the columns", "The number of solutions"], answer: 1, explanation: "|det| is the area scale factor; the sign shows whether orientation flips." },
  ],
  databases: [
    { id: "db1", prompt: "Which SQL clause filters groups after aggregation?", options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], answer: 1, explanation: "WHERE filters rows before grouping; HAVING filters groups after GROUP BY." },
    { id: "db2", prompt: "A table is in first normal form (1NF) when…", options: ["It has a primary key and no indexes", "Every column holds atomic values", "It has no foreign keys", "All non-key columns depend on the whole key"], answer: 1, explanation: "1NF forbids repeating groups and multi-valued cells. Full-key dependency is 2NF." },
    { id: "db3", prompt: "Which ACID property ensures a committed transaction survives a crash?", options: ["Atomicity", "Consistency", "Isolation", "Durability"], answer: 3, explanation: "Durability guarantees committed changes persist, usually through write-ahead logging." },
    { id: "db4", prompt: "A LEFT JOIN returns…", options: ["Only matching rows", "All rows from the left table plus matches from the right", "All rows from both tables", "Only non-matching rows"], answer: 1, explanation: "Left rows without a match still appear, with NULLs for the right table's columns." },
    { id: "db5", prompt: "A B+ tree index mainly speeds up…", options: ["Range and equality lookups", "Full table scans", "Data compression", "Backups"], answer: 0, explanation: "Sorted, balanced leaves make equality and range searches logarithmic." },
  ],
  "operating-systems": [
    { id: "os1", prompt: "Which condition is NOT required for deadlock?", options: ["Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"], answer: 2, explanation: "Deadlock needs no preemption; if resources can be taken away, deadlock can be broken." },
    { id: "os2", prompt: "Round-robin scheduling gives each process…", options: ["Unlimited CPU time", "A fixed time quantum in turn", "Priority by memory use", "CPU time only when others block"], answer: 1, explanation: "Processes run for one time slice each, then move to the back of the ready queue." },
    { id: "os3", prompt: "A page fault happens when…", options: ["The CPU overheats", "A referenced page isn't in physical memory", "Two processes share a page", "The disk is full"], answer: 1, explanation: "The OS must load the missing page from disk before the access can continue." },
    { id: "os4", prompt: "Threads in the same process share…", options: ["Their stacks", "Their registers", "The address space", "Their program counters"], answer: 2, explanation: "Threads share code, heap, and globals; each has its own stack, registers, and program counter." },
    { id: "os5", prompt: "A mutex is used to…", options: ["Speed up I/O", "Ensure only one thread enters a critical section at a time", "Allocate memory", "Schedule processes"], answer: 1, explanation: "Mutual exclusion locks protect shared data from concurrent modification." },
  ],
  networks: [
    { id: "nw1", prompt: "Which protocol provides reliable, ordered delivery?", options: ["UDP", "TCP", "IP", "ICMP"], answer: 1, explanation: "TCP uses sequence numbers, acknowledgments, and retransmission. UDP makes no guarantees." },
    { id: "nw2", prompt: "DNS translates…", options: ["MAC addresses to IP addresses", "Domain names to IP addresses", "IP addresses to ports", "HTTP to HTTPS"], answer: 1, explanation: "DNS resolves human-readable names like example.com to IP addresses." },
    { id: "nw3", prompt: "Which layer of the TCP/IP model does routing happen in?", options: ["Application", "Transport", "Internet (network)", "Link"], answer: 2, explanation: "IP routing forwards packets between networks at the internet/network layer." },
    { id: "nw4", prompt: "How many addresses are in a /24 IPv4 subnet?", options: ["24", "128", "256", "1024"], answer: 2, explanation: "32 − 24 = 8 host bits, so 2⁸ = 256 addresses (254 usable hosts)." },
    { id: "nw5", prompt: "The TCP three-way handshake is…", options: ["SYN, SYN-ACK, ACK", "SYN, ACK, FIN", "HELLO, ACK, DONE", "GET, OK, CLOSE"], answer: 0, explanation: "The client sends SYN, the server replies SYN-ACK, and the client confirms with ACK." },
  ],
  "machine-learning": [
    { id: "ml1", prompt: "Overfitting means a model…", options: ["Performs poorly on training data", "Fits training data well but generalizes poorly", "Has too few parameters", "Trains too slowly"], answer: 1, explanation: "An overfit model learns noise in the training set, so test performance drops." },
    { id: "ml2", prompt: "Which task is supervised learning?", options: ["Clustering customers", "Predicting house prices from labeled sales", "Reducing dimensions with PCA", "Finding association rules"], answer: 1, explanation: "Supervised learning trains on inputs paired with known target labels." },
    { id: "ml3", prompt: "What does gradient descent minimize?", options: ["The number of features", "A loss function", "The training time", "The learning rate"], answer: 1, explanation: "It repeatedly steps opposite the gradient to reduce the loss." },
    { id: "ml4", prompt: "Cross-validation is used to…", options: ["Speed up training", "Estimate how well a model generalizes", "Label data automatically", "Remove outliers"], answer: 1, explanation: "Training and validating on different folds gives a more reliable estimate of performance on unseen data." },
    { id: "ml5", prompt: "Logistic regression is typically used for…", options: ["Predicting a continuous value", "Binary classification", "Clustering", "Image generation"], answer: 1, explanation: "It models the probability of a class with the logistic (sigmoid) function." },
  ],
}
