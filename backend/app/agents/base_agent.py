from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from langchain_core.messages import BaseMessage

"""
BaseAgent interface for all trading agents.
See: PLANNING.md, Phase 3 - Core Agent Logic
"""

class TradingAgent(ABC):
    """
    Base class for all trading agents.
    Provides a standard interface for agent communication and analysis.
    """
    name: str
    description: str

    def __init__(self, name: str, description: str):
        """
        Initialize the agent with a name and description.
        """
        self.name = name
        self.description = description
        self.memory: List[BaseMessage] = []
        
    @abstractmethod
    async def analyze(self, message: Dict[str, Any]) -> Any:
        """
        Analyze the provided message and return a result.
        Should be implemented by subclasses.
        Args:
            message: AgentMessage or compatible dict
        Returns:
            Any: Analysis result (type depends on agent)
        """
        raise NotImplementedError("analyze() must be implemented by subclasses.")
        
    @abstractmethod
    async def explain(self, analysis: Any) -> str:
        """
        Provide a human-readable explanation of the analysis result.
        Should be implemented by subclasses.
        Args:
            analysis: The result from analyze()
        Returns:
            str: Explanation string
        """
        raise NotImplementedError("explain() must be implemented by subclasses.")
        
    def add_to_memory(self, message: BaseMessage):
        """
        Add a message to the agent's memory (conversation or context history).
        Args:
            message: The message to add (BaseMessage or compatible dict).
        See: PLANNING.md, Phase 3 - Core Agent Logic, Step 7: Memory Management
        """
        self.memory.append(message)

    def get_memory(self) -> List[BaseMessage]:
        """
        Retrieve the agent's memory (conversation or context history).
        Returns:
            List of messages in memory.
        See: PLANNING.md, Phase 3 - Core Agent Logic, Step 7: Memory Management
        """
        return self.memory
        
    def clear_memory(self):
        """
        Clear the agent's memory.
        See: PLANNING.md, Phase 3 - Core Agent Logic, Step 7: Memory Management
        """
        self.memory = [] 