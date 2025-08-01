def blob_callback(blob, metadata):
    if metadata.path.decode() == b"backend/.gitignore":
        content = blob.data.decode('utf-8')
        lines = content.splitlines()
        filtered_lines = [line for line in lines if not line.startswith('GROQ_API_KEY=')]
        blob.data = "\n".join(filtered_lines).encode('utf-8')