from flask import Flask
from flask_login import LoginManager
from flask_cors import CORS
from config import Config
from models.models import db, Admin, ContactMessage

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS untuk frontend dengan konfigurasi lengkap
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000", 
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })
    
    # Initialize extensions
    db.init_app(app)
    
    # Setup Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Silakan login terlebih dahulu.'
    login_manager.login_message_category = 'warning'
    
    @login_manager.user_loader
    def load_user(user_id):
        try:
            return db.session.get(Admin, int(user_id))
        except Exception as e:
            print(f"Error loading user: {str(e)}")
            return None
    
    @login_manager.unauthorized_handler
    def unauthorized():
        from flask import flash, redirect, url_for, request
        
        if request.path.startswith('/api/'):
            return {"success": False, "message": "Unauthorized. Please login first."}, 401
        
        flash('Silakan login terlebih dahulu.', 'warning')
        return redirect(url_for('auth.login'))
    
    # Context Processor - Tambah unread messages count
    @app.context_processor
    def inject_unread_messages():
        """Inject unread messages count ke semua template"""
        try:
            unread_count = ContactMessage.query.filter_by(is_read=False).count()
            return dict(unread_messages_count=unread_count)
        except:
            return dict(unread_messages_count=0)
    
    # Register blueprints untuk Admin Panel
    from routes.auth import auth_bp
    from routes.dashboard import dashboard_bp
    from routes.gejala import gejala_bp
    from routes.penyakit import penyakit_bp
    from routes.aturan import aturan_bp
    from routes.riwayat import riwayat_bp
    from routes.profile import profile_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(gejala_bp)
    app.register_blueprint(penyakit_bp)
    app.register_blueprint(aturan_bp)
    app.register_blueprint(riwayat_bp)
    app.register_blueprint(profile_bp)
    
    # Register blueprints untuk User API (Frontend React)
    from routes.konsultasi import konsultasi_bp
    from routes.auth_user import auth_user_bp
    from routes.contact_api import contact_bp
    
    app.register_blueprint(konsultasi_bp)
    app.register_blueprint(auth_user_bp)
    app.register_blueprint(contact_bp)
    
    # ===========================================================
    # Register blueprint untuk AI Chat  (INI BAGIAN YANG DIBETULKAN)
    # ===========================================================
    try:
        # 🔥 FIX PENTING: gunakan openrouter.py (file baru yang benar)
        from routes.openrouter import openrouter_bp

        app.register_blueprint(openrouter_bp)
        print("✅ AI Chat ready (Menggunakan routes/openrouter.py)")

    except ImportError as e:
        print(f"⚠️  AI Chat not loaded: {e}")
    
    # Create tables
    with app.app_context():
        try:
            db.create_all()
            
            # Create default admin if not exists
            admin = Admin.query.filter_by(username='admin').first()
            if not admin:
                admin = Admin(username='admin', nama_admin='Administrator')
                admin.set_password('admin')
                db.session.add(admin)
                db.session.commit()
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
    
    # Favicon handler
    @app.route('/favicon.ico')
    def favicon():
        return '', 204
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        from flask import request, render_template
        
        if request.path == '/favicon.ico':
            return '', 204
        
        if request.path.startswith('/api/'):
            return {
                "success": False, 
                "message": f"Endpoint tidak ditemukan: {request.path}"
            }, 404
        
        try:
            return render_template('errors/404.html'), 404
        except:
            return '''
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - Halaman Tidak Ditemukan</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        text-align: center;
                        padding: 20px;
                    }
                    .error-container {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 40px;
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                    }
                    h1 { font-size: 72px; margin: 0; }
                    p { font-size: 20px; margin: 20px 0; }
                    a {
                        display: inline-block;
                        padding: 12px 30px;
                        background: white;
                        color: #667eea;
                        text-decoration: none;
                        border-radius: 10px;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    a:hover { background: #f0f0f0; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>404</h1>
                    <p>Halaman yang Anda cari tidak ditemukan</p>
                    <a href="/">← Kembali ke Beranda</a>
                </div>
            </body>
            </html>
            ''', 404
    
    @app.errorhandler(500)
    def internal_error(error):
        from flask import request, render_template
        
        db.session.rollback()
        
        if request.path.startswith('/api/'):
            return {"success": False, "message": "Terjadi kesalahan server"}, 500
        
        try:
            return render_template('errors/500.html'), 500
        except:
            return '''
            <!DOCTYPE html>
            <html>
            <head>
                <title>500 - Server Error</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        text-align: center;
                        padding: 20px;
                    }
                    .error-container {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 40px;
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                    }
                    h1 { font-size: 72px; margin: 0; }
                    p { font-size: 20px; margin: 20px 0; }
                    a {
                        display: inline-block;
                        padding: 12px 30px;
                        background: white;
                        color: #667eea;
                        text-decoration: none;
                        border-radius: 10px;
                        font-weight: bold;
                        margin-top: 20px;
                    }
                    a:hover { background: #f0f0f0; }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <h1>500</h1>
                    <p>Terjadi kesalahan pada server</p>
                    <p style="font-size: 16px;">Silakan coba lagi nanti</p>
                    <a href="/">← Kembali ke Beranda</a>
                </div>
            </body>
            </html>
            ''', 500
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        try:
            from sqlalchemy import text
            db.session.execute(text('SELECT 1'))
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        return {
            "success": True, 
            "message": "API berjalan dengan baik", 
            "status": "healthy",
            "database": db_status
        }, 200
    
    # Root endpoint
    @app.route('/')
    def root():
        from flask import redirect, url_for
        return redirect(url_for('auth.index'))
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
