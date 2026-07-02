import os
import re
import json
import spacy
from typing import Dict, List, Set, Tuple
from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Predefined taxonomy of skills categorized
SKILLS_TAXONOMY = {
    # Languages
    "python": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "java": "Java",
    "c++": "C++",
    "c#": "C#",
    "ruby": "Ruby",
    "php": "PHP",
    "go": "Go",
    "golang": "Go",
    "rust": "Rust",
    "html": "HTML",
    "css": "CSS",
    "sql": "SQL",
    "r": "R",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "bash": "Bash",
    "c": "C",
    
    # Frontend
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "angular": "Angular",
    "vue": "Vue",
    "vuejs": "Vue",
    "vue.js": "Vue",
    "svelte": "Svelte",
    "next.js": "Next.js",
    "nextjs": "Next.js",
    "redux": "Redux",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "sass": "Sass",
    "bootstrap": "Bootstrap",
    "webpack": "Webpack",
    "vite": "Vite",
    
    # Backend
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "express": "Express.js",
    "expressjs": "Express.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "node": "Node.js",
    "spring": "Spring Boot",
    "spring boot": "Spring Boot",
    "nestjs": "NestJS",
    "asp.net": "ASP.NET",
    "dotnet": ".NET",
    "laravel": "Laravel",
    "rails": "Ruby on Rails",
    
    # Databases
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "mysql": "MySQL",
    "sqlite": "SQLite",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "dynamodb": "DynamoDB",
    "oracle": "Oracle",
    "firebase": "Firebase",
    
    # Cloud & DevOps
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "google cloud": "GCP",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "jenkins": "Jenkins",
    "terraform": "Terraform",
    "ansible": "Ansible",
    "nginx": "Nginx",
    
    # Data & AI
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "pytorch": "PyTorch",
    "tensorflow": "TensorFlow",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "spark": "Apache Spark",
    "tableau": "Tableau",
    "powerbi": "Power BI",
    "power bi": "Power BI",
    "excel": "Microsoft Excel",
    "ms excel": "Microsoft Excel",
    "microsoft excel": "Microsoft Excel",
    "generative ai": "Generative AI",
    "genai": "Generative AI",
    "llm": "Large Language Models",
    "large language models": "Large Language Models",
    
    # Product & Management
    "figma": "Figma",
    "adobe xd": "Adobe XD",
    "photoshop": "Photoshop",
    "illustrator": "Illustrator",
    "ui/ux": "UI/UX",
    "uiux": "UI/UX",
    "agile": "Agile",
    "scrum": "Scrum",
    "kanban": "Kanban",
    "jira": "Jira",
    "product management": "Product Management",
    
    # Concepts
    "rest api": "REST API",
    "restful": "REST API",
    "graphql": "GraphQL",
    "microservices": "Microservices",
    "testing": "Testing",
    "unit testing": "Unit Testing",
    "integration testing": "Integration Testing",
    "system design": "System Design",
    "security": "Security",
    "oauth": "OAuth",
    "jwt": "JWT",
    "communication": "Communication",
    "communication skills": "Communication",
    "problem-solving": "Problem Solving",
    "problem solving": "Problem Solving",
    "adaptability": "Adaptability",
    "teamwork": "Teamwork",
    "team work": "Teamwork",
    "leadership": "Leadership",
    "time management": "Time Management"
}

ACTION_VERBS = {
    "led", "architected", "engineered", "optimized", "designed", "developed", 
    "built", "managed", "implemented", "authored", "accelerated", "created", 
    "delivered", "automated", "refactored", "spearheaded", "mentored", "coordinated"
}

EDUCATION_KEYWORDS = ["bachelor", "master", "phd", "ph.d", "doctorate", "bs", "ms", "btech", "mtech", "b.s", "m.s", "degree", "university", "college"]

# Load spaCy English model
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    # Fallback if loading failed
    nlp = None

class NLPEngine:
    def __init__(self):
        self.model = None
        self.use_fallback = False
        try:
            # Try to load SentenceTransformer
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print("SentenceTransformer 'all-MiniLM-L6-v2' loaded successfully.")
        except Exception as e:
            print(f"Warning: Failed to load SentenceTransformer. Falling back to TF-IDF. Error: {e}")
            self.use_fallback = True
            
    def clean_text(self, text: str) -> str:
        """Normalize whitespace and lowercase the text."""
        if not text:
            return ""
        text = text.lower()
        # replace newlines/tabs with space
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
        
    def extract_skills(self, text: str) -> Set[str]:
        """Extract skills from text based on regex mapping of the taxonomy."""
        cleaned = self.clean_text(text)
        found_skills = set()
        
        for key, display_name in SKILLS_TAXONOMY.items():
            # Escape key to handle characters like ++, .
            escaped_key = re.escape(key)
            # Match boundary for letters/numbers, but allow symbols
            # We want to match \bkey\b or edge cases
            if key == "c++":
                pattern = r'\bc\+\+(?:\b|[^\w]|$)'
            elif key == "c#":
                pattern = r'\bc\#(?:\b|[^\w]|$)'
            elif key == ".net" or key == "asp.net":
                pattern = r'(?:\b|[^\w]|^)' + escaped_key + r'(?:\b|[^\w]|$)'
            else:
                pattern = r'\b' + escaped_key + r'\b'
                
            if re.search(pattern, cleaned):
                found_skills.add(display_name)
                
        return found_skills

    def extract_experience_years(self, text: str) -> List[str]:
        """Find mentions of years of experience in the text."""
        cleaned = self.clean_text(text)
        # Search for patterns like '5 years', '3+ years', '10 years of experience'
        pattern = r'\b(\d{1,2}\+?)\s*(?:years?)(?:\s+of\s+experience)?\b'
        matches = re.findall(pattern, cleaned)
        return matches

    def extract_education(self, text: str) -> List[str]:
        """Identify mention of degrees or educational institutions."""
        lines = text.split('\n')
        education_lines = []
        for line in lines:
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in EDUCATION_KEYWORDS):
                # Clean and append the line
                education_lines.append(line.strip())
        return education_lines[:5] # Return top 5 matches

    def calculate_semantic_similarity(self, resume_text: str, jd_text: str) -> float:
        """Calculate cosine similarity using SentenceTransformers or TF-IDF fallback."""
        if not self.use_fallback and self.model:
            try:
                emb_resume = self.model.encode(resume_text, convert_to_tensor=True)
                emb_jd = self.model.encode(jd_text, convert_to_tensor=True)
                similarity = util.cos_sim(emb_resume, emb_jd).item()
                # Map to [0, 1] scale (similarity can sometimes be negative, let's clamp it)
                return max(0.0, float(similarity))
            except Exception as e:
                print(f"Error in SentenceTransformer encoding: {e}. Switching to TF-IDF.")
                self.use_fallback = True
                
        # TF-IDF Fallback
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf = vectorizer.fit_transform([resume_text, jd_text])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return max(0.0, float(sim))
        except Exception as e:
            print(f"Error in TF-IDF calculation: {e}")
            return 0.0

    def calculate_keyword_match(self, resume_text: str, jd_text: str) -> float:
        """Calculate word overlap score of key words (nouns/adjectives)."""
        if nlp:
            try:
                doc_resume = nlp(resume_text[:20000]) # Limit length to prevent sluggishness
                doc_jd = nlp(jd_text[:20000])
                
                # Extract clean nouns/adjectives
                words_resume = {token.lemma_.lower() for token in doc_resume if token.pos_ in ["NOUN", "PROPN", "ADJ"] and not token.is_stop}
                words_jd = {token.lemma_.lower() for token in doc_jd if token.pos_ in ["NOUN", "PROPN", "ADJ"] and not token.is_stop}
            except Exception as e:
                print(f"spaCy processing error: {e}. Falling back to simple split.")
                words_resume = set(re.findall(r'\b\w{3,15}\b', resume_text.lower()))
                words_jd = set(re.findall(r'\b\w{3,15}\b', jd_text.lower()))
        else:
            # Fallback split
            words_resume = set(re.findall(r'\b\w{3,15}\b', resume_text.lower()))
            words_jd = set(re.findall(r'\b\w{3,15}\b', jd_text.lower()))

        # Intersect
        if not words_jd:
            return 1.0
        intersection = words_resume.intersection(words_jd)
        
        # We calculate overlap relative to the job description keywords
        # Let's take the overlap size divided by the total keywords in JD, capped/weighted
        # A good ratio is size / len(words_jd), capped at 1.0
        score = len(intersection) / len(words_jd)
        return min(1.0, score)

    def generate_suggestions(self, resume_text: str, missing_skills: List[str]) -> List[str]:
        """Generate specific resume enhancement ideas."""
        suggestions = []
        cleaned_resume = resume_text.lower()
        
        # 1. Missing Skills Suggestions
        if missing_skills:
            skills_str = ", ".join(missing_skills[:5])
            suggestions.append(f"Add critical missing skills required by the job: {skills_str}.")
            
        # 2. Section Checks
        sections = {
            "experience": ["experience", "employment", "history", "work history", "career"],
            "education": ["education", "academic", "degree", "university", "college"],
            "skills": ["skills", "technologies", "expertise", "competencies"],
            "contact": ["contact", "email", "phone", "linkedin", "address"]
        }
        
        for sec, keywords in sections.items():
            if not any(kw in cleaned_resume for kw in keywords):
                suggestions.append(f"Create a clear '{sec.capitalize()}' section. This is vital for ATS parsers.")
                
        # 3. Action Verb Analysis
        found_verbs = [verb for verb in ACTION_VERBS if re.search(r'\b' + verb + r'\b', cleaned_resume)]
        if len(found_verbs) < 4:
            suggestions.append(
                "Incorporate stronger action verbs in your experience descriptions (e.g., 'Architected', 'Spearheaded', 'Optimized') to demonstrate leadership and impact."
            )
            
        # 4. Detail level check
        word_count = len(resume_text.split())
        if word_count < 150:
            suggestions.append("Your resume seems too brief. Expand on your project accomplishments, responsibilities, and methodologies.")
        elif word_count > 1500:
            suggestions.append("Your resume is quite verbose (over 1500 words). Trim down descriptions and aim for a clean 1-2 page layout.")
            
        # Default fallback suggestion if resume is good
        if not suggestions:
            suggestions.append("Your resume is well-structured! Focus on tailoring the project bullet points to match the exact phrasing of the job description.")
            
        return suggestions

    def analyze(self, resume_text: str, jd_text: str) -> dict:
        """Run the full analysis engine and compute scores."""
        # Clean inputs
        clean_resume = self.clean_text(resume_text)
        clean_jd = self.clean_text(jd_text)
        
        if not clean_resume or not clean_jd:
            return {
                "match_score": 0.0,
                "semantic_score": 0.0,
                "skill_score": 0.0,
                "keyword_score": 0.0,
                "matched_skills": [],
                "missing_skills": [],
                "experience_years": [],
                "education": [],
                "suggestions": ["Please provide both a valid resume and job description."]
            }
            
        # Extract skills
        resume_skills = self.extract_skills(resume_text)
        jd_skills = self.extract_skills(jd_text)
        
        # Intersections
        matched_skills = list(resume_skills.intersection(jd_skills))
        missing_skills = list(jd_skills.difference(resume_skills))
        
        # Skill Score (30%)
        if not jd_skills:
            skill_score = 1.0
        else:
            skill_score = len(matched_skills) / len(jd_skills)
            
        # Semantic Score (50%)
        semantic_score = self.calculate_semantic_similarity(clean_resume, clean_jd)
        
        # Keyword Score (20%)
        keyword_score = self.calculate_keyword_match(clean_resume, clean_jd)
        
        # Weighted Final Score (out of 100)
        # We boost the scores slightly because perfect 1.0 is rare in real resumes
        # Let's multiply by 100 to convert to percentage
        final_score = (0.50 * semantic_score + 0.30 * skill_score + 0.20 * keyword_score) * 100
        
        # Clamp score between 0 and 100
        final_score = min(100.0, max(0.0, round(final_score, 1)))
        
        # Extract extra metadata
        experience_years = self.extract_experience_years(resume_text)
        education = self.extract_education(resume_text)
        
        # Generate suggestions
        suggestions = self.generate_suggestions(resume_text, missing_skills)
        
        return {
            "match_score": final_score,
            "semantic_score": round(semantic_score * 100, 1),
            "skill_score": round(skill_score * 100, 1),
            "keyword_score": round(keyword_score * 100, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "resume_skills": sorted(list(resume_skills)),
            "experience_years": experience_years,
            "education": education,
            "suggestions": suggestions
        }

# Singleton instance
engine = NLPEngine()
