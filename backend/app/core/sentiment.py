from transformers import pipeline

# Global model variable to load lazily or on startup
emotion_pipeline = None

def get_emotion_pipeline():
    global emotion_pipeline
    if emotion_pipeline is None:
        print("Loading Sentiment Model...")
        # Using a model fine-tuned for emotion detection
        emotion_pipeline = pipeline("text-classification", model="bhadresh-savani/bert-base-uncased-emotion", return_all_scores=True)
    return emotion_pipeline

def analyze_emotion(text: str) -> dict:
    """
    Analyzes the text and returns a dictionary of emotion scores.
    """
    classifier = get_emotion_pipeline()
    # Truncate text if too long for BERT (simple handling)
    results = classifier(text[:512]) 
    
    # Transform list of dicts [{'label': 'joy', 'score': 0.9}, ...] to {'joy': 0.9, ...}
    scores = {item['label']: item['score'] for item in results[0]}
    
    # Sort by score descending for easier reading
    sorted_scores = dict(sorted(scores.items(), key=lambda item: item[1], reverse=True))
    
    return sorted_scores

def validate_arc(segments: list[str], intended_arc: list[str], threshold: float = 0.5) -> list[int]:
    """
    Checks if the dominant emotion of each segment matches the intended emotion.
    Returns indices of segments that deviate.
    """
    deviations = []
    for i, segment in enumerate(segments):
        if i >= len(intended_arc):
            break
            
        emotions = analyze_emotion(segment)
        dominant_emotion = next(iter(emotions)) # Top 1
        
        intended = intended_arc[i]
        
        # Check if intended emotion is strong enough
        if emotions.get(intended, 0) < threshold:
             deviations.append(i)
             
    return deviations
