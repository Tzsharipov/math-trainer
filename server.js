const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
  'https://ielcnbcvslloqzmrzzqc.supabase.co',
  'sb_secret_hvodDBVrEE0u48SYafRxTA_8AuyY_eb'
);

app.get('/api/users', async (req, res) => {
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    res.json(users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});