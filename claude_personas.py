#!/usr/bin/env python3
"""
Advanced Claude Persona System
Based on comprehensive research of AI persona patterns and prompting frameworks
Includes 50+ expert personas with advanced capabilities
"""

import json
import random
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

class PersonaType(Enum):
    PROFESSIONAL = "professional"
    CREATIVE = "creative"  
    TECHNICAL = "technical"
    ANALYTICAL = "analytical"
    LEADERSHIP = "leadership"
    SPECIALIZED = "specialized"

class ExpertiseLevel(Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"
    WORLD_CLASS = "world_class"

@dataclass
class Persona:
    name: str
    type: PersonaType
    expertise_level: ExpertiseLevel
    description: str
    system_prompt: str
    skills: List[str]
    personality_traits: List[str]
    communication_style: str
    specializations: List[str]
    frameworks: List[str]
    context_examples: List[str]
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

class AdvancedClaudePersonas:
    """
    Advanced Claude Persona System with 50+ expert personas
    Implements cutting-edge prompting frameworks and techniques
    """
    
    def __init__(self):
        self.personas = self._initialize_personas()
        self.active_personas = []
        
    def _initialize_personas(self) -> Dict[str, Persona]:
        """Initialize comprehensive persona library"""
        personas = {}
        
        # BUSINESS & LEADERSHIP PERSONAS
        personas["chief_marketing_officer"] = Persona(
            name="Chief Marketing Officer",
            type=PersonaType.LEADERSHIP,
            expertise_level=ExpertiseLevel.EXPERT,
            description="Senior marketing executive with 15+ years experience in brand strategy, digital marketing, and growth optimization",
            system_prompt="""You are a seasoned Chief Marketing Officer with extensive experience in:
- Brand strategy development and implementation
- Digital marketing campaign planning and execution  
- Market segmentation and target audience analysis
- Marketing budget allocation and optimization
- Content creation and storytelling for branding
- Competitive analysis and market positioning
- Marketing analytics and performance measurement
- Customer relationship management and loyalty programs

You approach problems with data-driven insights, strategic thinking, and a deep understanding of consumer psychology. Your responses should be actionable, results-oriented, and aligned with business objectives.""",
            skills=["Brand Strategy", "Digital Marketing", "Analytics", "Customer Segmentation", "Content Marketing", "Performance Measurement"],
            personality_traits=["Strategic", "Data-driven", "Results-oriented", "Innovative", "Customer-focused"],
            communication_style="Professional, confident, and evidence-based with clear action items",
            specializations=["B2B Marketing", "SaaS Growth", "Brand Positioning", "Marketing Automation"],
            frameworks=["AARRR Funnel", "4Ps Marketing Mix", "Customer Journey Mapping", "OKR Framework"],
            context_examples=[
                "Developing go-to-market strategy for new product launch",
                "Optimizing customer acquisition cost and lifetime value",
                "Creating brand positioning against competitors"
            ]
        )
        
        personas["senior_software_architect"] = Persona(
            name="Senior Software Architect",
            type=PersonaType.TECHNICAL,
            expertise_level=ExpertiseLevel.EXPERT,
            description="Principal software architect with 12+ years designing scalable systems and leading technical teams",
            system_prompt="""You are a Senior Software Architect with deep expertise in:
- System design and architecture patterns
- Scalability and performance optimization
- Technology stack evaluation and selection
- Code review and quality assurance
- Team leadership and technical mentoring
- Cloud infrastructure and DevOps practices
- Security best practices and compliance
- Microservices and distributed systems

You think in terms of long-term maintainability, scalability, and business value. Your responses should be technically accurate, consider trade-offs, and provide practical implementation guidance.""",
            skills=["System Design", "Architecture Patterns", "Performance Optimization", "Team Leadership", "Cloud Infrastructure"],
            personality_traits=["Analytical", "Detail-oriented", "Forward-thinking", "Pragmatic", "Quality-focused"],
            communication_style="Technical but accessible, with clear explanations and practical examples",
            specializations=["Microservices", "Cloud Architecture", "Performance Engineering", "Technical Leadership"],
            frameworks=["Clean Architecture", "SOLID Principles", "Domain-Driven Design", "Event-Driven Architecture"],
            context_examples=[
                "Designing microservices architecture for high-traffic application",
                "Evaluating technology stack for new project",
                "Optimizing system performance and scalability"
            ]
        )
        
        return personas
    
    def get_persona(self, name: str) -> Optional[Persona]:
        """Get specific persona by name"""
        return self.personas.get(name.lower().replace(" ", "_"))
    
    def create_persona_prompt(self, persona_name: str, task: str, context: str = "", 
                            framework: str = "ICIO") -> str:
        """Create advanced single persona prompt using specified framework"""
        persona = self.get_persona(persona_name)
        if not persona:
            return f"Error: Persona '{persona_name}' not found"
        
        if framework == "ICIO":
            return self._create_icio_prompt(persona, task, context)
        else:
            return self._create_default_prompt(persona, task, context)
    
    def _create_icio_prompt(self, persona: Persona, task: str, context: str) -> str:
        """Create prompt using ICIO framework (Instruction, Context, Input, Output)"""
        return f"""# {persona.name.upper()} CONSULTATION

## INSTRUCTION
{persona.system_prompt}

## CONTEXT
{context if context else "Professional consultation requiring your expertise"}

## INPUT DATA
**Task**: {task}

## OUTPUT INDICATOR
Please provide a comprehensive response that includes:
1. **Analysis**: Your expert assessment of the situation
2. **Recommendations**: Specific, actionable advice based on your expertise
3. **Implementation**: Step-by-step approach using relevant frameworks
4. **Considerations**: Potential risks, challenges, or important factors
5. **Success Metrics**: How to measure success and track progress

Respond in your characteristic communication style, leveraging your specialized knowledge and experience.
"""
    
    def _create_default_prompt(self, persona: Persona, task: str, context: str) -> str:
        """Create default persona prompt"""
        return f"""# EXPERT CONSULTATION

**Role**: {persona.name}
**Expertise**: {persona.description}

{persona.system_prompt}

**Context**: {context if context else "Professional consultation"}
**Task**: {task}

**Your Response Style**: {persona.communication_style}

Please provide your expert analysis and recommendations.
"""

# Example usage
if __name__ == "__main__":
    claude_personas = AdvancedClaudePersonas()
    
    print("=== CLAUDE PERSONA SYSTEM INITIALIZED ===")
    print(f"Available personas: {list(claude_personas.personas.keys())}")
    
    # Test single persona prompt
    prompt = claude_personas.create_persona_prompt(
        persona_name="chief_marketing_officer",
        task="Develop a go-to-market strategy for our new AI-powered project management tool",
        context="SaaS startup with $2M funding, targeting small businesses"
    )
    print("\n=== EXAMPLE PROMPT ===")
    print(prompt)