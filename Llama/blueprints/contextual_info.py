from flask import Blueprint, request, jsonify

contextual_info_bp = Blueprint("contextual_info_bp", __name__)

@contextual_info_bp.route('/contextual_info', methods=['GET'])
def get_contextual_info():
    condition = request.args.get('condition')
    info = {
        "title": "Informasi Tidak Ditemukan",
        "recommendations": [],
        "video_url": None
    }
    if condition == 'drought':
        info = {
            "title": "💡 Rekomendasi Hadapi Kekeringan",
            "recommendations": [
                "Gunakan teknik irigasi tetes untuk efisiensi air.",
                "Tanam varietas tanaman yang tahan kekeringan (contoh: sorgum, jagung hibrida tertentu).",
                "Tingkatkan bahan organik tanah dengan pupuk kompos untuk menahan air lebih lama."
            ],
            "video_url": "https://www.youtube.com/embed/exampleVideoID"
        }
    elif condition == 'pest_outbreak':
         info = {
            "title": "⚠️ Rekomendasi Penanganan Hama",
            "recommendations": [
                "Lakukan rotasi tanaman untuk memutus siklus hidup hama.",
                "Gunakan pestisida nabati seperti ekstrak daun nimba.", 
                "Pasang perangkap likat kuning untuk menarik serangga terbang."
            ],
            "video_url": "https://www.youtube.com/embed/examplePestVideoID"
        }
    return jsonify(info)
