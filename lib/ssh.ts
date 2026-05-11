import { Client } from 'ssh2';

export async function execSSH(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(cmd, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        let out = '';
        stream.on('close', (code: any, signal: any) => {
          conn.end();
          resolve(out);
        }).on('data', (data: any) => {
          out += data;
        }).stderr.on('data', (data: any) => {
          out += data;
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).connect({
      host: '82.208.22.226',
      port: 22,
      username: 'root',
      password: process.env.SMTP_PASSWORD || ''
    });
  });
}
