from datetime import datetime, timezone
from typing import List, Optional, Any
from bson import ObjectId
from pydantic import BaseModel, Field, GetCoreSchemaHandler
from pydantic_core import CoreSchema, core_schema


# ---------- USER MODELS ----------
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    telegram_chat_id: str
    skills: List[str] = []

class UserLogin(BaseModel):
    username: str
    password: str


# ---------- CUSTOM OBJECTID ----------
class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: GetCoreSchemaHandler) -> CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.no_info_after_validator_function(
                    lambda x: ObjectId(x) if not isinstance(x, ObjectId) else x,
                    core_schema.str_schema(),
                ),
            ]),
            serialization=core_schema.str_schema(),
        )


# ---------- JOB MODELS ----------
class JobBase(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    description: str
    link: str
    applied: bool = False


class Job(JobBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    owner_id: str
    date_added: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: Optional[str] = None
    external_id: Optional[str] = None  # e.g. job posting unique id or hash
    skills_matched: List[str] = []
    last_checked: Optional[datetime] = None
    change_history: List[dict] = []  # [{'changed_at': datetime, 'diff': {...}}]

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }


class JobCreate(JobBase):
    skills_matched: List[str] = []
    source: Optional[str] = None
    link: str
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }


class SkillsUpdate(BaseModel):
    skills: List[str]
