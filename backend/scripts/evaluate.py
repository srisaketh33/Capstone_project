import asyncio
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.sentiment import validate_arc
from app.core.coherence import check_consistency
from app.core.memory import memory_manager

async def run_evaluation():
    print("--- Starting Narrative Evaluation ---")
    
    # Mock data for evaluation
    sample_text = "The hero walked into the dark room. He felt a surge of joy."
    intended_arc = ["joy"]
    context = "The hero is afraid of the dark."
    
    print(f"\nEvaluating Text: '{sample_text}'")
    
    # 1. Sentiment Arc Correlation
    deviations = validate_arc([sample_text], intended_arc, threshold=0.5)
    score_sentiment = 1.0 if not deviations else 0.0
    print(f"Sentiment Alignment Score: {score_sentiment} (0=Fail, 1=Pass)")
    
    # 2. Consistency Check (LLM)
    print("\nRunning Consistency Check (LLM)...")
    consistency_result = await check_consistency(sample_text, context)
    issues_count = len(consistency_result.get("plot_holes", [])) + len(consistency_result.get("character_inconsistencies", []))
    score_consistency = max(0, 1.0 - (issues_count * 0.2)) # Penalize 0.2 per issue
    print(f"Consistency Score: {score_consistency:.2f}")
    print(f"Issues Found: {consistency_result}")
    
    # 3. Overall Score
    final_score = (score_sentiment + score_consistency) / 2
    print(f"\n--- Final Evaluation Score: {final_score:.2f} / 1.0 ---")

if __name__ == "__main__":
    asyncio.run(run_evaluation())
