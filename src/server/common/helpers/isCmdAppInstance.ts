export function isCmdAppInstance() {
  return (
    'NODE_REPL_HISTORY_FILE' in process.env
      || 'CMD_APP_INSTANCE' in process.env
  );
}
