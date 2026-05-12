import { getPool } from '../lib/db.js';
import { calculateScore } from '../utils/score.js';
import { newId } from '../utils/id.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import format from 'pg-format';

// Helpers to map between API shape (camelCase) and DB (snake_case)
function toDbRow(p) {
  return {
    id: p.id,
    name: p.name,
    age: p.age ?? null,
    salary: p.salary ?? null,
    occupation: p.occupation ?? null,
    looks: p.looks ?? null,
    height: p.height ?? null,
    managed_by: p.managedBy ?? null,
    native: p.native ?? null,
    resident: p.resident ?? null,
    college: p.college ?? null,
    surname: p.surname ?? null,
    gotra: p.gotra ?? null,
    food: p.food ?? null,
    maanglik: p.maanglik ?? null,
    family_background: p.familyBackground ?? null,
    final_verdict: p.finalVerdict ?? null,
    notes: p.notes ?? null,
    score: p.score ?? null,
    created_at: p.createdAt ?? Date.now()
  };
}

function fromDbRow(r) {
  return {
    id: r.id,
    name: r.name,
    age: r.age,
    salary: Number(r.salary),
    occupation: r.occupation,
    looks: r.looks,
    height: r.height,
    managedBy: r.managed_by,
    native: r.native,
    resident: r.resident,
    college: r.college,
    surname: r.surname,
    gotra: r.gotra,
    food: r.food,
    maanglik: r.maanglik,
    familyBackground: r.family_background,
    finalVerdict: r.final_verdict,
    notes: r.notes,
    score: r.score,
    createdAt: Number(r.created_at)
  };
}

export async function listProfiles(req, res) {
  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC');
    res.json(rows.map(fromDbRow));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function createProfile(req, res) {
  try {
    const input = req.body || {};
    const id = input.id || newId();
    const createdAt = Date.now();
    const score = calculateScore(input);
    const row = toDbRow({ ...input, id, score, createdAt });

    const pool = await getPool();
    const sql = `INSERT INTO profiles (id, name, age, salary, occupation, looks, height, managed_by, native, resident, college, surname, gotra, food, maanglik, family_background, final_verdict, notes, score, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`;
    const params = [
      row.id, row.name, row.age, row.salary, row.occupation, row.looks, row.height, row.managed_by, row.native, row.resident,
      row.college, row.surname, row.gotra, row.food, row.maanglik, row.family_background, row.final_verdict, row.notes,
      row.score, row.created_at
    ];
    await pool.query(sql, params);
    res.status(201).json({ ...fromDbRow(row) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const input = req.body || {};
    // Recalculate score on updates
    const score = calculateScore(input);
    const pool = await getPool();
    const sql = `UPDATE profiles SET name=$1, age=$2, salary=$3, occupation=$4, looks=$5, height=$6, managed_by=$7, native=$8, resident=$9, college=$10, surname=$11, gotra=$12, food=$13, maanglik=$14, family_background=$15, final_verdict=$16, notes=$17, score=$18 WHERE id=$19`;
    const params = [
      input.name, input.age, input.salary, input.occupation, input.looks, input.height, input.managedBy, input.native, input.resident,
      input.college, input.surname, input.gotra, input.food, input.maanglik, input.familyBackground, input.finalVerdict, input.notes,
      score, id
    ];
    const { rowCount } = await pool.query(sql, params);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    const { rows } = await pool.query('SELECT * FROM profiles WHERE id=$1', [id]);
    res.json(fromDbRow(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateVerdict(req, res) {
  try {
    const { id } = req.params;
    const { finalVerdict } = req.body || {};
    const pool = await getPool();
    const { rowCount } = await pool.query('UPDATE profiles SET final_verdict=$1 WHERE id=$2', [finalVerdict || null, id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    const { rows } = await pool.query('SELECT * FROM profiles WHERE id=$1', [id]);
    res.json(fromDbRow(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function deleteProfile(req, res) {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const { rowCount } = await pool.query('DELETE FROM profiles WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateNotes(req, res) {
  try {
    const { id } = req.params;
    const { notes } = req.body || {};
    const pool = await getPool();
    const { rowCount } = await pool.query('UPDATE profiles SET notes=$1 WHERE id=$2', [notes || null, id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    const { rows } = await pool.query('SELECT * FROM profiles WHERE id=$1', [id]);
    res.json(fromDbRow(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function exportSQL(req, res) {
  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC');

    let sqlContent = `-- Betu Marriage App Data Dump\n` +
      `-- Table Structure\n` +
      `CREATE TABLE IF NOT EXISTS profiles (\n` +
      `    id VARCHAR(64) PRIMARY KEY,\n` +
      `    name VARCHAR(255) NOT NULL,\n` +
      `    age INT,\n` +
      `    salary DECIMAL(15, 2),\n` +
      `    occupation VARCHAR(100),\n` +
      `    looks VARCHAR(100),\n` +
      `    height VARCHAR(50),\n` +
      `    managed_by VARCHAR(100),\n` +
      `    native VARCHAR(100),\n` +
      `    resident VARCHAR(100),\n` +
      `    college VARCHAR(100),\n` +
      `    surname VARCHAR(100),\n` +
      `    gotra VARCHAR(100),\n` +
      `    food VARCHAR(100),\n` +
      `    maanglik VARCHAR(50),\n` +
      `    family_background VARCHAR(100),\n` +
      `    final_verdict VARCHAR(50),\n` +
      `    notes TEXT,\n` +
      `    score INT,\n` +
      `    created_at BIGINT\n` +
      `);\n\n-- Data\n`;

    const safe = (val) => (val === null || val === undefined || val === '') ? 'NULL' : `'$${String(val).replace(/'/g, "''")}'`.replace(/^'\$/,'\'');

    for (const r of rows) {
      sqlContent += `INSERT INTO profiles (id, name, age, salary, occupation, looks, height, managed_by, native, resident, college, surname, gotra, food, maanglik, family_background, final_verdict, notes, score, created_at) VALUES (` +
        `${safe(r.id)}, ${safe(r.name)}, ${r.age ?? 'NULL'}, ${r.salary ?? 'NULL'}, ${safe(r.occupation)}, ${safe(r.looks)}, ${safe(r.height)}, ${safe(r.managed_by)}, ${safe(r.native)}, ${safe(r.resident)}, ${safe(r.college)}, ${safe(r.surname)}, ${safe(r.gotra)}, ${safe(r.food)}, ${safe(r.maanglik)}, ${safe(r.family_background)}, ${safe(r.final_verdict)}, ${safe(r.notes)}, ${r.score ?? 'NULL'}, ${r.created_at ?? 'NULL'});
`;
    }

    const filename = `betu_profiles_backup_${new Date().toISOString().slice(0,10)}.sql`;
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(sqlContent);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function exportExcel(req, res) {
  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC');

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Profiles');
    ws.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Age', key: 'age', width: 8 },
      { header: 'Salary', key: 'salary', width: 10 },
      { header: 'Score', key: 'score', width: 8 },
      { header: 'Verdict', key: 'finalVerdict', width: 12 },
      { header: 'Remarks', key: 'notes', width: 30 },
      { header: 'Occupation', key: 'occupation', width: 20 },
      { header: 'Looks', key: 'looks', width: 14 },
      { header: 'Height', key: 'height', width: 14 },
      { header: 'Managed By', key: 'managedBy', width: 12 },
      { header: 'Native', key: 'native', width: 12 },
      { header: 'Resident', key: 'resident', width: 12 },
      { header: 'College', key: 'college', width: 18 },
      { header: 'Surname', key: 'surname', width: 12 },
      { header: 'Gotra', key: 'gotra', width: 12 },
      { header: 'Food', key: 'food', width: 12 },
      { header: 'Maanglik', key: 'maanglik', width: 10 },
      { header: 'Family Background', key: 'familyBackground', width: 18 },
    ];

    for (const r of rows.map(fromDbRow)) {
      ws.addRow(r);
    }

    const filename = `Betu_Profiles_${new Date().toISOString().slice(0,10)}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function exportPDF(req, res) {
  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC');

    const filename = `profiles_${new Date().toISOString().slice(0,10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    doc.pipe(res);

    doc.fontSize(16).text('Betu Marriage Proposals', { align: 'left' });
    doc.moveDown(1);

    doc.fontSize(10);
    const headers = ['Name', 'Age', 'Score', 'Verdict', 'Occupation'];
    doc.text(headers.join(' | '));
    doc.moveDown(0.5);
    doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke();
    doc.moveDown(0.5);

    for (const r of rows.map(fromDbRow)) {
      const line = [r.name, r.age ?? '', r.score ?? '', r.finalVerdict || '-', r.occupation || ''].join(' | ');
      doc.text(line);
    }

    doc.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function importExcel(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(req.file.buffer);
    const ws = wb.worksheets[0];
    if (!ws) return res.status(400).json({ error: 'Empty Excel file' });

    const rows = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const get = (idx) => row.getCell(idx).value ?? '';
      const profile = {
        id: newId(),
        name: String(get(1) || 'Unknown'),
        age: Number(get(2) || 25),
        salary: Number(get(3) || 10),
        finalVerdict: String(get(5) || ''),
        notes: String(get(6) || 'Imported from Excel'),
        occupation: 'swe_good', looks: 'acceptable', height: 'medium', managedBy: 'family',
        native: 'up', resident: 'india', college: 'tier1_good', surname: 'ok', gotra: 'ok', food: 'veg', maanglik: 'no', familyBackground: 'excellent'
      };
      profile.score = calculateScore(profile);
      rows.push(toDbRow({ ...profile, createdAt: Date.now() }));
    });

    if (rows.length === 0) return res.json({ imported: 0 });

    const pool = await getPool();
    const values = rows.map(r => [r.id, r.name, r.age, r.salary, r.occupation, r.looks, r.height, r.managed_by, r.native, r.resident, r.college, r.surname, r.gotra, r.food, r.maanglik, r.family_background, r.final_verdict, r.notes, r.score, r.created_at]);
    const sql = format(`INSERT INTO profiles (id, name, age, salary, occupation, looks, height, managed_by, native, resident, college, surname, gotra, food, maanglik, family_background, final_verdict, notes, score, created_at) VALUES %L`, values);
    await pool.query(sql);

    res.json({ imported: rows.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
