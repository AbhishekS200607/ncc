const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginAdmin = async (username, password) => {
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !admin) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return { token, username: admin.username, email: admin.email };
};

module.exports = { loginAdmin };
