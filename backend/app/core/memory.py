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
        Adds a narrative event to the Vector DB and maintains a rolling history of 10 items.
        """
        if metadata is None:
            metadata = {}
        
        # Use a sortable ISO timestamp with precision
        metadata["timestamp"] = datetime.now().isoformat()
        
        # Simple ID generation
        event_id = f"evt_{datetime.now().timestamp()}"
        
        events_collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[event_id]
        )
        print(f"Event added to memory: {event_id}")
        
        # Auto-cleanup to keep only last 10 prompts
        self._cleanup_history()

    def _cleanup_history(self):
        """
        Maintains only the 10 most recent events in ChromaDB.
        """
        try:
            results = events_collection.get()
            if not results['ids'] or len(results['ids']) <= 10:
                return

            # Combine IDs and timestamps for sorting
            items = []
            for i in range(len(results['ids'])):
                items.append({
                    "id": results['ids'][i],
                    "timestamp": results['metadatas'][i].get("timestamp", "")
                })

            # Sort by timestamp (asc) to find oldest items
            items.sort(key=lambda x: x['timestamp'])

            # Identify IDs to delete (those beyond the last 10)
            to_delete = [item['id'] for item in items[:-10]]
            
            if to_delete:
                print(f"Cleaning up {len(to_delete)} old memory items...")
                events_collection.delete(ids=to_delete)
        except Exception as e:
            print(f"Error during history cleanup: {e}")

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
                 # Truncate each document if it's too long to prevent prompt clogging
                 truncated_doc = doc[:1000] + "..." if len(doc) > 1000 else doc
                 context_str += f"- {truncated_doc}\n"
                 
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

    def get_all_profiles_summary(self, filter_text: str = None) -> str:
        """
        Returns a summary of character profiles. 
        If filter_text is provided, only returns profiles whose names or descriptions match the text.
        """
        summary = "Character Profiles:\n"
        found = False
        for name, data in self.profiles.items():
            # If search text is provided, only include if name is mentioned
            if filter_text and name.lower() not in filter_text.lower():
                continue
            
            summary += f"- {name}: {data}\n"
            found = True
        
        return summary if found else ""

    def get_all_history(self) -> dict:
        """
        Retrieves all past events, sorted by recency.
        """
        results = events_collection.get()
        if not results['ids']:
            return results

        # Zip data to sort together
        zipped = list(zip(results['ids'], results['documents'], results['metadatas']))
        # Sort by timestamp in metadata (descending - most recent first)
        zipped.sort(key=lambda x: x[2].get('timestamp', ''), reverse=True)

        # Unzip
        ids, docs, metas = zip(*zipped)
        return {
            "ids": list(ids),
            "documents": list(docs),
            "metadatas": list(metas)
        }

    def clear_all_history(self):
        """
        Deletes all entries from the history collection.
        """
        try:
            results = events_collection.get()
            if results['ids']:
                events_collection.delete(ids=results['ids'])
                print("All memory items cleared.")
        except Exception as e:
            print(f"Error clearing memory: {e}")

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
