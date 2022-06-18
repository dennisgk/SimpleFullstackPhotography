import shutil

duse = shutil.disk_usage("/")

print(f'total={duse.total};used={duse.used};free={duse.free}')