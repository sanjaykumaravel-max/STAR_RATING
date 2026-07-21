import { buildReportHtml } from "../src/utils/exportHtml";

describe("buildReportHtml", () => {
  test("renders the core report sections for empty data", () => {
    const html = buildReportHtml();

    expect(html).toContain("Module Scores");
    expect(html).toContain("Mine Details");
    expect(html).toContain("Answers");
    expect(html).toContain("Proofs / Attachments");
  });

  test("escapes every dynamic report field", () => {
    const html = buildReportHtml(
      { name: "Mine <script>alert('x')</script>" },
      {
        moduleScores: { "Module <one>": "<strong>10</strong>" },
        answers: { "Answer <key>": "<img src=x onerror=alert(1)>" },
        proofs: { "Proof <key>": { name: "proof <unsafe>.jpg" } },
      },
    );

    expect(html).toContain("Mine &lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;");
    expect(html).toContain("Module &lt;one&gt;");
    expect(html).toContain("&lt;strong&gt;10&lt;/strong&gt;");
    expect(html).toContain("Answer &lt;key&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(html).toContain("proof &lt;unsafe&gt;.jpg");
  });
});
