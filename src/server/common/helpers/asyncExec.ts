import childProcess from 'child_process';
import util from 'util';

export const asyncExec = util.promisify(childProcess.exec);
