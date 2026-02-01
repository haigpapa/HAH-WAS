# hah-was (حَقّ وَس / Truth-Was)

> An epistemic defense system that detects AI hallucinations and protects cultural truth from the Localization Gap.

## 0. System Intent

This system armors users against AI-generated misinformation. It proves that adversarial verification—pitting generative AI against grounded search—can expose hallucinations and preserve cultural specificity that generic models erase.

It exists to defend what AI smooths away.

## 1. Why This System Exists

**What failed before:**
- Users trust LLM outputs without verification (hallucination blindness)
- Fact-checking tools work only for mainstream English topics (Wikipedia-centric)
- Cultural knowledge from minoritized communities gets "corrected" toward dominant narratives
- No tools exist to detect the **Localization Gap**: when AI "translates" cultural specificity into generic Western equivalents

**What tension shaped this design:**
AI models hallucinate with confidence. They generate plausible-sounding falsehoods about Armenian history, queer Middle Eastern experience, Arabic music theory—domains underrepresented in training data. Worse, they "localize" by mapping unfamiliar concepts onto familiar (Western) ones, erasing the very specificity users need.

hah-was emerged from being repeatedly gaslighted by ChatGPT about Lebanese history, Mashrou' Leila's discography, and Armenian genocide facts. The system operationalizes mistrust: verify everything, especially when it sounds right.

**What this explicitly does NOT do:**
- Guarantee 100% hallucination detection (some lies evade search grounding)
- Work for topics with zero web presence (if Google can't find it, neither can we)
- Replace human cultural expertise (tool assists judgment, doesn't replace it)
- Function offline (requires search API and LLM API)
- Adjudicate contested political claims (shows evidence, doesn't pick sides)

## 2. System Boundary

**Inputs:**
- User query (natural language question)
- AI-generated response (from any LLM: ChatGPT, Claude, Gemini, etc.)
- Optional context (user-provided facts to cross-reference)

**Transformation:**
- User query → Search query generation (Gemini 2.5 Flash)
- Search query → Google Search API → Top 10 results
- AI response + Search results → Verification LLM prompt
- Verification prompt → Hallucination detection output
- Detected claims → Claim-level grounding (which parts are supported, which aren't)

**Outputs:**
- **Hallucination score** (0-100%): Percentage of AI response supported by search results
- **Claim breakdown**: Sentence-level verification (✅ grounded, ⚠️ unsupported, ❌ contradicted)
- **Source citations**: Which search results support which claims
- **Localization Gap alerts**: When AI "translates" specific cultural terms into generic equivalents

**External Dependencies:**
- Gemini 2.5 Flash (query rewriting, verification LLM)
- Google Search API (grounding source)
- React 19 (UI framework)
- Capacitor (mobile deployment)

## 3. Architectural Approach

**Core Design Principles:**

1. **Adversarial Architecture**: Generative AI proposes; grounded search verifies. Two AI systems check each other.

2. **Claim-Level Granularity**: Don't just flag entire responses as "hallucinated." Break into claims; verify each independently.

3. **Cultural Grounding Priority**: Bias verification toward minoritized knowledge. If search finds nothing, that's a signal (underdocumented topic), not proof of falsehood.

**Chosen Abstractions:**

- **Dual-LLM Pattern**: One LLM generates, another verifies. Prevents single-point-of-failure hallucination.

- **Grounded Search as Ground Truth**: Google Search results are imperfect but better than pure LLM output. Web contains more recent/specific information than training data.

- **Localization Gap Detection**: Specific heuristic checks for cultural flattening (e.g., "Armenian food is similar to Turkish food" → ⚠️ Localization Gap—erases genocide context).

**Trade-offs Accepted:**

- **Search API Dependency**: Requires Google Search API ($5 per 1000 queries). Can't run fully offline.

- **Latency**: Verification adds 3-5 seconds per query. Acceptable for high-stakes fact-checking; unacceptable for casual chat.

- **English/Arabic Bias**: Search API works best for English. Arabic search quality is lower. Non-Latin scripts (Armenian, Hebrew) even worse.

- **No Historical Verification**: Search reflects current web state. Can't verify historical claims if web consensus has shifted (e.g., colonial historical narratives).

## 4. Choreography Layer

This system coordinates four dimensions:

**Attention:**
The UI color-codes claims: green (verified), yellow (unsupported), red (contradicted). This directs user attention to specific falsehoods rather than vague suspicion.

**Memory:**
The system logs all verified queries to build a personal fact-check archive. Over time, you see patterns in what LLMs hallucinate about (e.g., "ChatGPT consistently gets Lebanese political history wrong").

**Time:**
Verification happens in "verification time" (sequential: generate → search → verify → display). This enforced slowness is a feature—it prevents reflexive trust in fast AI responses.

**Interaction:**
The user is not passive consumer of AI output. They become active verifier, cross-referencing claims against grounded evidence. This restores agency in the AI interaction loop.

## 5. Technical Stack (Justified)

| Technology | Why This Choice |
|------------|-----------------|
| **React 19** | Latest React with improved Suspense for async verification states. Clean component model for claim-level UI. |
| **Gemini 2.5 Flash** | Fast, cheap LLM for query rewriting and verification. Strong multilingual support (Arabic/English). API-first—no local model hosting. |
| **Google Search API** | Industry-standard search with grounding capabilities. Gemini's native grounding uses this under the hood. Programmatic access via API. |
| **Capacitor** | Cross-platform mobile deployment (iOS/Android) from single React codebase. Needed for on-the-go fact-checking. |
| **TypeScript** | Type safety for complex claim parsing and verification logic. Prevents runtime errors when mapping search results to UI. |
| **Tailwind CSS** | Utility-first styling for rapid UI iteration. Color-coded claims (green/yellow/red) easy to implement with utility classes. |
| **Zustand** | Lightweight state management for verification results, search history, user settings. No Redux boilerplate. |

## 6. Artifacts

**Architecture Diagram:**
```
User Query + AI Response
    ↓
Query Rewriting (Gemini 2.5)
    ↓
Google Search API
    ↓
Top 10 Search Results
    ↓
Verification LLM (Gemini 2.5)
    ↓
Claim-Level Analysis
    ↓
Hallucination Score + Citations
    ↓
UI Rendering (Color-Coded Claims)
```

**Key Code Excerpts:**

```typescript
// Verify AI response against search results
async function verifyResponse(
  query: string,
  aiResponse: string
): Promise<VerificationResult> {
  // Step 1: Rewrite query for better search results
  const searchQuery = await rewriteQuery(query);

  // Step 2: Get grounded search results
  const searchResults = await googleSearch(searchQuery, { numResults: 10 });

  // Step 3: LLM verification with grounding
  const verification = await gemini.verify({
    prompt: `
      Original query: ${query}
      AI response: ${aiResponse}
      Search results: ${JSON.stringify(searchResults)}

      Verify each claim in the AI response.
      Mark as:
      - ✅ GROUNDED (supported by search results)
      - ⚠️ UNSUPPORTED (no evidence found)
      - ❌ CONTRADICTED (search results disagree)

      Also check for Localization Gap: cultural terms translated into generic Western equivalents.
    `
  });

  return {
    score: calculateHallucinationScore(verification),
    claims: verification.claims,
    sources: searchResults,
    localizationGaps: detectLocalizationGaps(verification)
  };
}
```

```typescript
// Localization Gap heuristic detection
function detectLocalizationGaps(text: string): LocalizationGap[] {
  const gaps: LocalizationGap[] = [];

  // Pattern 1: "X is similar to Y" (where Y is Western dominant culture)
  if (text.match(/armenian food is similar to turkish/i)) {
    gaps.push({
      type: 'cultural_flattening',
      claim: 'Armenian food similar to Turkish',
      reason: 'Erases genocide context and forced assimilation'
    });
  }

  // Pattern 2: Translating specific term to generic
  if (text.match(/oud.*like a lute/i)) {
    gaps.push({
      type: 'western_analogy',
      claim: 'Oud described as "like a lute"',
      reason: 'Reduces culturally specific instrument to Western comparison'
    });
  }

  return gaps;
}
```

```typescript
// Color-code UI based on verification
function ClaimDisplay({ claim }: { claim: VerifiedClaim }) {
  const colorClass =
    claim.status === 'grounded' ? 'bg-green-100' :
    claim.status === 'unsupported' ? 'bg-yellow-100' :
    'bg-red-100';

  return (
    <div className={`p-4 rounded ${colorClass}`}>
      <p>{claim.text}</p>
      {claim.sources.length > 0 && (
        <div className="mt-2 text-sm">
          Sources: {claim.sources.map(s => <a href={s.url}>{s.title}</a>)}
        </div>
      )}
    </div>
  );
}
```

**Interface Definitions:**
```typescript
interface VerificationResult {
  score: number; // 0-100, percentage of response that is grounded
  claims: VerifiedClaim[];
  sources: SearchResult[];
  localizationGaps: LocalizationGap[];
}

interface VerifiedClaim {
  text: string;
  status: 'grounded' | 'unsupported' | 'contradicted';
  sources: SearchResult[]; // Which search results support this claim
}

interface LocalizationGap {
  type: 'cultural_flattening' | 'western_analogy' | 'erasure';
  claim: string;
  reason: string; // Why this is problematic
}
```

## 7. Failure Modes & Limits

**What breaks:**
- **Underdocumented topics** → If Google Search finds nothing, system flags as "unsupported" even if true. Bias toward well-documented (Western) knowledge.
- **Recent events** → LLM training data may be more recent than search index in rare cases. Verification can lag reality.
- **Paywalled sources** → Search results behind paywalls can't be read for verification. Citation exists but content unavailable.
- **Contested facts** → When web has conflicting claims (political disputes, historical revisionism), system shows disagreement but can't adjudicate truth.

**What scales poorly:**
- **Long responses** (>500 words) → Claim extraction becomes imprecise. Sentence-level verification gets noisy.
- **Multilingual mixing** → Arabic/English code-switching confuses claim parsing. Need language-specific verification.
- **Niche cultural knowledge** → If only 1-2 web sources exist, verification is brittle. Dependent on source quality.

**What was consciously deferred:**
- **Primary source verification**: Only checks against web search, not original documents/archives. Would need academic database access.
- **Historical fact-checking**: No access to historical archives or timestamped web snapshots. Present-biased.
- **Visual verification**: Can't fact-check images or videos. Text-only.
- **Real-time monitoring**: No alerts when previously verified facts become outdated.

**What would require architectural changes:**
- **Offline verification** → Would need local document corpus + local LLM. Quality degrades significantly.
- **Academic grounding** → Would need Jstor, JSTOR, academic database APIs. Expensive and restricted access.
- **Multimedia verification** → Would need image/video grounding models. Computationally intensive.

## 8. Background & Context

This system emerged from:
- **AI gaslighting experience**: Being repeatedly told false "facts" about Lebanese history, Armenian genocide, Mashrou' Leila's discography by ChatGPT.
- **Localization Gap research**: Studying how AI models "translate" minoritized cultural knowledge into Western equivalents, erasing specificity.
- **Displacement and epistemic violence**: Exile creates vulnerability to historical revisionism. Needed tools to defend cultural memory.
- **Gemini Grounding release (2024)**: Google's grounded search API made adversarial verification technically feasible.

It synthesizes:
- **Adversarial machine learning**: Using one AI system to check another
- **Grounded generation**: Retrieval-augmented generation for factual accuracy
- **Epistemic justice theory**: Protecting minoritized knowledge from dominant narratives
- **UI/UX for trust**: Color-coded claims, source citations, transparency in verification process

**Current Status:**
- **Active Development** (2024–)
- Functional prototype deployed as web app + mobile (Capacitor)
- Used for personal fact-checking and research
- Open to testers and collaborators

**Future Directions:**
- Integration with DERIVE for memory verification (cross-check archived fragments against current web state)
- Academic database grounding (JSTOR, Google Scholar) for scholarly claims
- Community verification network (crowdsourced cultural expertise for underdocumented topics)

**Etymology:**
The name **hah-was** (حَقّ وَس) is Arabic wordplay:
- **حَقّ** (haqq) = truth, right, fact
- **وَس** (was) = interjection meaning "enough!" or "stop!"

Together: "Truth-Stop" or "Truth-Was" → a demand to pause AI output and verify. Also sounds like "house" (haus, هَوْس), suggesting a shelter for truth.

---

## Meaning Stack Navigator

This repository represents the **Veracity Shield Layer** of the **Meaning Stack**. Coordinate your navigation through the ecosystem here:

| Layer | System | Intent |
| :--- | :--- | :--- |
| **Sensorium** | [3D-Beat-Synth](https://github.com/haigpapa/3D-Beat-Synth) | Body as Input |
| **Latent Space** | [STORYLINES](https://github.com/haigpapa/STORYLINES) | Memory as Space |
| **Conductor** | [DERIVE](https://github.com/haigpapa/DERIVE) | Logic & Tuning |
| **Stage** | [photon+](https://github.com/haigpapa/photon) | Output & Performance |
| **Veracity Shield** | [hah-was](https://github.com/haigpapa/HAH-WAS) | Epistemic Defense |

**Operating System**: [ECHO (hmp00)](https://github.com/haigpapa/hmp00) | **Methodology**: [Choreography of Systems](https://github.com/haigpapa/choreography-of-systems)

---

**Maintained by:** [Haig Papazian](https://github.com/haigpapa) / [Walaw Studio](https://walaw.studio)
**Repository:** [github.com/haigpapa/hah-was](https://github.com/haigpapa/hah-was)
**License:** MIT (See LICENSE)
