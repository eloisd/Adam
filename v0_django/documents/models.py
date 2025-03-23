from django.db import models
from pathlib import Path

# BASE_DIR = Path(__file__).resolve().parent.parent

# Create your models here.
class Document(models.Model):
    title = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    # path = models.FileField(upload_to='documents/')
    # path = Path.joinpath(BASE_DIR, "documents/docstore/", name)
    path = "docstore/" + str(title)