// ...existing imports...
import { suggestScores } from "../api/ai";
import PrimaryButton from "./PrimaryButton"; // or use <Button> from MUI

// inside component:
const [aiSuggestion, setAiSuggestion] = useState(null);
const [aiLoading, setAiLoading] = useState(false);

const handleAiSuggest = async () => {
  try {
    setAiLoading(true);
    const resp = await suggestScores(answers, mine);
    if (resp?.ok && resp.ai) {
      setAiSuggestion(resp.ai);
      toast.success("AI suggestion ready");
    } else {
      toast.error("AI suggestion failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("AI suggestion failed");
  } finally {
    setAiLoading(false);
  }
};

// In JSX near Submit button:
<PrimaryButton onClick={handleAiSuggest} disabled={aiLoading}>
  {aiLoading ? "Thinking..." : "Suggest Scores (AI)"}
</PrimaryButton>
{aiSuggestion && <pre style={{ textAlign: "left", maxHeight: 200, overflow: "auto" }}>{JSON.stringify(aiSuggestion, null, 2)}</pre>}