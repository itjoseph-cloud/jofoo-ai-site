import {spawnSync} from 'node:child_process';
const options={stdio:'inherit',env:{...process.env,INCLUDE_DRAFTS:'1'}};
const result=process.platform==='win32'
  ? spawnSync('cmd.exe',['/d','/s','/c','npm.cmd run build'],options)
  : spawnSync('npm',['run','build'],options);
process.exit(result.status??1);
