# Tách nền ảnh nhân vật (rembg, mô hình isnet-anime / isnet-general-use).
# Dùng: pip install rembg opencv-python-headless; python3 cut.py <thư_mục_ảnh_gốc> <thư_mục_mặt_nạ>
import sys, glob, os
from PIL import Image
from rembg import remove, new_session
src, out = sys.argv[1], sys.argv[2]
for model in ['isnet-anime', 'isnet-general-use']:
    sess = new_session(model)
    for f in sorted(glob.glob(src + '/*')):
        name = os.path.splitext(os.path.basename(f))[0]
        im = Image.open(f).convert('RGB')
        m = remove(im, session=sess, only_mask=True, post_process_mask=True)
        m.save(f'{out}/{name}__{model}.png')
    print(model, 'done')
