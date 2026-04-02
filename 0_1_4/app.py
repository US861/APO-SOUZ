from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from flask_mysqldb import MySQL
import bcrypt
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = 'QewjqndhduiiOIODHkjhhjgJH315367'
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'  
app.config['MYSQL_PASSWORD'] = '1234'  
app.config['MYSQL_DB'] = 'apo_soyuz'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('auth'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('index.html', logged_in='user_id' in session)

@app.route('/about')
def about():
    return render_template('about.html', logged_in='user_id' in session)

@app.route('/auth', methods=['GET', 'POST'])
def auth():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            session['user_id'] = user['id']
            session['username'] = user['username']
            return redirect(url_for('categories'))
        else:
            flash('Неверное имя пользователя или пароль', 'error')
    return render_template('auth.html', logged_in='user_id' in session)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/add-product', methods=['GET', 'POST'])
def add_product():
    if request.method == 'POST':
        name = request.form['name']
        price = request.form['price']
        image_path = None
        image = request.files.get('image')
        if image and image.filename:
            import uuid
            filename = f"{uuid.uuid4().hex}_{image.filename}"
            upload_folder = os.path.join('static', 'catalog')
            os.makedirs(upload_folder, exist_ok=True)
            full_path = os.path.join(upload_folder, filename)
            image.save(full_path)
            image_path = f"catalog/{filename}"
        cur = mysql.connection.cursor()
        cur.execute("""
                    INSERT INTO products (name, price, image_path)
                    VALUES (%s, %s, %s)
                    """, (name, price, image_path))
        mysql.connection.commit()
        cur.close()
        flash('Товар успешно добавлен!', 'success')
        return redirect(url_for('categories'))
    return render_template('add-product.html', logged_in=True)

@app.route('/delete-product/<int:product_id>', methods=['POST'])
@login_required
def delete_product(product_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT image_path FROM products WHERE id = %s", (product_id,))
        product = cur.fetchone()
        cur.execute("DELETE FROM products WHERE id = %s", (product_id,))
        mysql.connection.commit()
        if product and product['image_path']:
            image_path = os.path.join('static', product['image_path'])
            if os.path.exists(image_path):
                os.remove(image_path)
        cur.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/categories')
def categories():
    search_query = request.args.get('search', '')
    cur = mysql.connection.cursor()
    if search_query:
        cur.execute("SELECT * FROM products WHERE name LIKE %s ORDER BY name", ('%' + search_query + '%',))
    else:
        cur.execute("SELECT * FROM products ORDER BY name")
    products = cur.fetchall()
    cur.close()
    return render_template('categories.html',
                           products=products,
                           logged_in='user_id' in session,
                           search_query=search_query)

@app.route('/api/products')
def api_products():
    search = request.args.get('search', '')
    cur = mysql.connection.cursor()
    if search:
        cur.execute("SELECT * FROM products WHERE name LIKE %s", ('%' + search + '%',))
    else:
        cur.execute("SELECT * FROM products")
    products = cur.fetchall()
    cur.close()
    return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True)