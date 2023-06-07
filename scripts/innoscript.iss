
#define AppName "Escaux-Monitor"
#define AppPublisher "BigWhale Inc."
#define AppURL "https://github.com/MinerBigWhale/Escaux-Monitor"
#define AppExeName "escaux-monitor.exe"
#define AppVersion "1.0"
#define AppBuild 1001

[Setup]
; NOTE: The value of AppId uniquely identifies this application. Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{2CCF1253-8FE7-4675-8AC5-3767B87F7A48}
AppName={#AppName}
AppVersion={#AppVersion}
;AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
; Uncomment the following line to run in non administrative install mode (install for current user only.)
;PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=..\dist
OutputBaseFilename={#AppName}-Setup-v{#AppVersion}.{#AppBuild}
SetupIconFile=..\scripts\foldercharts.ico
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "..\out\escaux-monitor-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\out\escaux-monitor-win32-x64\resources\*"; DestDir: "{app}\resources"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExeName}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(AppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent


[Registry]
; ---start autoupdate code; see http://agiletrack.net/samples/sample-istool-installer.html--
Root: HKLM; Subkey: Software\{#AppName}; ValueType: string; ValueName: CurrentVersion; ValueData: {code:GetAppCurrentVersion|''}; Flags: uninsdeletekey

[Code]
function GetAppVersion(param: String): String;
begin
Result:='{#AppVersion}';
end;

function GetAppCurrentVersion(param: String): String;
begin
Result:='{#AppBuild}';
end;

function GetAppID(param: String): String;
begin
Result := '{#AppName}';
end;

function GetPathInstalled(AppID: String): String;
var
PrevPath: String;
begin
PrevPath := '';
if not RegQueryStringValue(HKLM, 'Software\Microsoft\Windows\CurrentVersion\Uninstall\'+AppID+'_is1', 'Inno Setup: App Path', PrevPath) then begin
RegQueryStringValue(HKCU, 'Software\Microsoft\Windows\CurrentVersion\Uninstall\'+AppID+'_is1', 'Inno Setup: App Path', PrevPath);
end;
Result := PrevPath;
end;

function GetInstalledVersion(): String;
var
InstalledVersion: String;
begin
InstalledVersion := '';
RegQueryStringValue(HKLM, 'Software\{#AppName}', 'Version', InstalledVersion);
Result := InstalledVersion;
end;

function GetInstalledCurrentVersion(): String;
var
InstalledCurrentVersion: String;
begin
InstalledCurrentVersion := '';
RegQueryStringValue(HKLM, 'Software\{#AppName}', 'CurrentVersion', InstalledCurrentVersion);
Result := InstalledCurrentVersion;
end;

function InitializeSetup(): Boolean;
var
Response: Integer;
PrevDir: String;
InstalledVersion: String;
InstalledCurrentVersion: String;
//VersionError: String;
begin
Result := true;

// read the installation folder
PrevDir := GetPathInstalled(getAppID(''));

if length(Prevdir) > 0 then begin
// I found the folder so it's an upgrade.

// compare versions
InstalledCurrentVersion := GetInstalledCurrentVersion();
InstalledVersion := GetAppCurrentVersion('');
if (InstalledCurrentVersion < InstalledVersion) then begin
Result := True;
end else if (InstalledCurrentVersion = InstalledVersion) then begin
Response := MsgBox(
'It appears that the existing {#AppName} installation is already current.' + #13#13 +
'Do you want to continue with the update installation?', mbError, MB_YESNO
);
Result := (Response = IDYES);
end else begin
Response := MsgBox(
'It appears that the existing {#AppName} installation is newer than this update.' + #13#13 +
'The existing installation is v'+ GetAppVersion('')+'.'+InstalledCurrentVersion +'. This update will change the installation to v'+ GetAppVersion('')+'.'+ GetAppCurrentVersion('') + '.' + #13#13 +
'Do you want to continue with the update installation?', mbError, MB_YESNO
);
Result := (Response = IDYES);
end;
end else begin
// Didn't find the folder so its a fresh installation.
Result:=true;
end;
end;

function ShouldSkipPage(PageID: Integer): Boolean;
var
PrevDir:String;
begin
PrevDir := GetPathInstalled(getAppID(''));
if length(Prevdir) > 0 then begin
// skip selectdir if It's an upgrade
if (PageID = wpSelectDir) then begin
Result := true;
end else if (PageID = wpSelectProgramGroup) then begin
Result := true;
end else if (PageID = wpSelectTasks) then begin
Result := true;
end else begin
Result := false;
end;
end;
end;
// ---end autoupdate code---



