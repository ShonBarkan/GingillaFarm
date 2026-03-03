import os
class BaseBlueprint:
    def __init__(self, root_dir):
        self.root_dir = root_dir

    def write_file(self, path, filename, content):
        with open(os.path.join(path, filename), 'w', encoding='utf-8') as f:
            f.write(content)
