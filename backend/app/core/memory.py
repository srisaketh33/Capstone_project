import chromadb
import json
import os
from datetime import datetime

# Initialize ChromaDB Client
# Using a local persistence directory
DB_PATH = "./data/chroma_db"
os.makedirs(DB_PATH, exist_ok=True)
chroma_client = chromadb.PersistentClient(path=DB_PATH)

# Create or get collection for narrative events
events_collection = chroma_client.get_or_create_collection(name="narrative_events")

# Path for Character Profiles JSON
PROFILES_PATH = "./data/profiles.json"
os.makedirs("./data", exist_ok=True)

class MemoryManager:
    def __init__(self):
        self._load_profiles()

    def _load_profiles(self):
        if os.path.exists(PROFILES_PATH):
            with open(PROFILES_PATH, 'r') as f:
                self.profiles = json.load(f)
        else:
            self.profiles = {}

    def _save_profiles(self):
        with open(PROFILES_PATH, 'w') as f:
            json.dump(self.profiles, f, indent=4)

    def add_event(self, text: str, metadata: dict = None):
        """
        Adds a narrative event to the Vector DB.
        """
        if metadata is None:
            metadata = {}
        
        metadata["timestamp"] = datetime.now().isoformat()
        
        # Simple ID generation
        event_id = f"evt_{datetime.now().timestamp()}"
        
        events_collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[event_id]
        )
        print(f"Event added to memory: {event_id}")

    def get_relevant_context(self, query: str, n_results: int = 3) -> str:
        """
        Retrieves relevant past events based on semantic similarity.
        """
        results = events_collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        # Format results into a string
        context_str = ""
        if results['documents']:
             for i, doc in enumerate(results['documents'][0]):
                 context_str += f"- {doc}\n"
                 
        return context_str

    def update_profile(self, character_name: str, traits: dict):
        """
        Updates or creates a character profile.
        """
        if character_name not in self.profiles:
            self.profiles[character_name] = {}
            
        self.profiles[character_name].update(traits)
        self._save_profiles()

    def get_profile(self, character_name: str) -> dict:
        return self.profiles.get(character_name, {})

    def get_all_profiles_summary(self) -> str:
        summary = "Character Profiles:\n"
        for name, data in self.profiles.items():
            summary += f"- {name}: {data}\n"
        return summary

    def assemble_prompt_context(self, current_scene_query: str, active_characters: list[str]) -> str:
        """
        Assembles context: High Priority (Profiles) + Low Priority (Vector Events).
        """
        # 1. High Priority: Profiles
        context = "--- CONTEXT ---\n"
        context += "CHARACTERS:\n"
        for name in active_characters:
            context += f"{name}: {str(self.get_profile(name))}\n"
            
        # 2. Low Priority: Events
        context += "\nPAST EVENTS:\n"
        context += self.get_relevant_context(current_scene_query)
        context += "---------------\n"
        
        return context

memory_manager = MemoryManager()
