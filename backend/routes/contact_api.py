from flask import Blueprint, request, jsonify
from models.models import db, ContactMessage, User
from datetime import datetime

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')

@contact_bp.route('/send', methods=['POST'])
def send_message():
    """
    API endpoint untuk mengirim pesan kontak dari user
    Frontend akan mengirim POST request ke endpoint ini
    """
    try:
        data = request.get_json()
        
        # Validasi input
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'message': f'Field {field} harus diisi!'
                }), 400
        
        # Cek apakah email terdaftar sebagai user
        user = User.query.filter_by(email=data['email']).first()
        user_id = user.id if user else None
        
        # Buat contact message baru
        contact_message = ContactMessage(
            user_id=user_id,
            name=data['name'],
            email=data['email'],
            subject=data['subject'],
            message=data['message'],
            is_read=False
        )
        
        db.session.add(contact_message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pesan berhasil dikirim! Admin akan segera merespons.',
            'data': {
                'id': contact_message.id,
                'created_at': contact_message.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Terjadi kesalahan: {str(e)}'
        }), 500

@contact_bp.route('/messages', methods=['GET'])
def get_messages():
    """
    API endpoint untuk mendapatkan daftar pesan (untuk admin)
    Optional: tambahkan authentication jika diperlukan
    """
    try:
        # Parameter query
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'all')  # all, read, unread
        
        # Query base
        query = ContactMessage.query
        
        # Filter berdasarkan status
        if status == 'read':
            query = query.filter_by(is_read=True)
        elif status == 'unread':
            query = query.filter_by(is_read=False)
        
        # Pagination
        messages = query.order_by(ContactMessage.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Format response
        result = {
            'success': True,
            'data': [{
                'id': msg.id,
                'name': msg.name,
                'email': msg.email,
                'subject': msg.subject,
                'message': msg.message,
                'is_read': msg.is_read,
                'created_at': msg.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'user_id': msg.user_id
            } for msg in messages.items],
            'pagination': {
                'page': messages.page,
                'per_page': messages.per_page,
                'total': messages.total,
                'pages': messages.pages,
                'has_next': messages.has_next,
                'has_prev': messages.has_prev
            }
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Terjadi kesalahan: {str(e)}'
        }), 500

@contact_bp.route('/messages/<int:id>', methods=['GET'])
def get_message_detail(id):
    """
    API endpoint untuk mendapatkan detail pesan
    """
    try:
        message = ContactMessage.query.get_or_404(id)
        
        result = {
            'success': True,
            'data': {
                'id': message.id,
                'name': message.name,
                'email': message.email,
                'subject': message.subject,
                'message': message.message,
                'is_read': message.is_read,
                'created_at': message.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'user_id': message.user_id,
                'user': {
                    'username': message.user.username,
                    'email': message.user.email
                } if message.user else None
            }
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Pesan tidak ditemukan'
        }), 404

@contact_bp.route('/messages/<int:id>/read', methods=['PUT'])
def mark_message_read(id):
    """
    API endpoint untuk menandai pesan sebagai sudah dibaca
    """
    try:
        message = ContactMessage.query.get_or_404(id)
        message.is_read = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Pesan ditandai sebagai sudah dibaca'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Terjadi kesalahan: {str(e)}'
        }), 500

@contact_bp.route('/unread-count', methods=['GET'])
def get_unread_count():
    """
    API endpoint untuk mendapatkan jumlah pesan yang belum dibaca
    """
    try:
        count = ContactMessage.query.filter_by(is_read=False).count()
        
        return jsonify({
            'success': True,
            'count': count
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Terjadi kesalahan: {str(e)}'
        }), 500