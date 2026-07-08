/**
 * Punto de entrada de la WebApp.
 */
function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};
  const page = params.page || 'home';
  const useRemote = remote_isHtmlEnabled_();
  let template;

  try {
    if (useRemote) {
      template = HtmlService.createTemplate(remote_fetchText_('frontend/Index.remote.html'));
    } else {
      template = HtmlService.createTemplateFromFile('Index');
    }
  } catch (err) {
    audit_('system', 'REMOTE_HTML_FALLBACK', 'WebApp', 'Index', String(err));
    template = HtmlService.createTemplateFromFile('Index');
  }

  template.app = web_getClientConfig();
  template.page = page;

  return template.evaluate()
    .setTitle(DJ_CONFIG.APP_NAME + ' | ' + DJ_CONFIG.TAGLINE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function includeRemote(path) {
  return remote_fetchText_(path);
}

/**
 * Ejecuta esto una vez para crear/validar la hoja de cálculo.
 * Puedes pasar una URL de Google Sheets o dejarla vacía para usar la hoja activa.
 */
function setup(spreadsheetUrl) {
  const ss = spreadsheetUrl ? db_setSpreadsheetByUrl_(spreadsheetUrl) : db_getSpreadsheet_();
  db_ensureSchema_();

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty(DJ_CONFIG.PROPS.adminPin)) {
    props.setProperty(DJ_CONFIG.PROPS.adminPin, '1234');
  }
  audit_('setup', 'SETUP_COMPLETED', 'Spreadsheet', ss.getId(), 'Esquema inicial creado/validado.');
  return jsonOk_({ spreadsheetId: ss.getId(), spreadsheetUrl: ss.getUrl(), adminPinDefault: '1234' });
}

/**
 * Configura el repositorio GitHub desde donde se leerán HTML/assets remotos.
 * repoFullName: "owner/repo"
 * ref: rama/tag/commit, por ejemplo "main"
 * token: opcional. Para repos privados, usar token con permiso de lectura.
 */
function setupRemoteFromGitHub(repoFullName, ref, token) {
  if (!repoFullName || repoFullName.indexOf('/') === -1) {
    throw new Error('repoFullName debe tener formato owner/repo');
  }
  const props = PropertiesService.getScriptProperties();
  props.setProperty(DJ_CONFIG.PROPS.githubRepo, repoFullName);
  props.setProperty(DJ_CONFIG.PROPS.githubRef, ref || DJ_CONFIG.DEFAULT_BRANCH);
  props.setProperty(DJ_CONFIG.PROPS.useRemoteHtml, 'true');
  if (token) props.setProperty(DJ_CONFIG.PROPS.githubToken, token);
  CacheService.getScriptCache().removeAll(['remote:frontend/Index.remote.html', 'remote:frontend/Styles.remote.html', 'remote:frontend/Scripts.remote.html']);
  audit_('setup', 'GITHUB_REMOTE_CONFIGURED', 'GitHub', repoFullName, 'Ref: ' + (ref || DJ_CONFIG.DEFAULT_BRANCH));
  return jsonOk_({ repoFullName: repoFullName, ref: ref || DJ_CONFIG.DEFAULT_BRANCH, remoteHtml: true });
}

function disableRemoteHtml() {
  PropertiesService.getScriptProperties().setProperty(DJ_CONFIG.PROPS.useRemoteHtml, 'false');
  return jsonOk_({ remoteHtml: false });
}
