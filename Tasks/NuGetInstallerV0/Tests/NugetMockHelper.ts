import tmrm = require('vsts-task-lib/mock-run');
import VersionInfoVersion from 'packaging-common/pe-parser/VersionInfoVersion'
import {VersionInfo} from 'packaging-common/pe-parser/VersionResource'

import * as pkgMock from 'packaging-common/Tests/MockHelper';

export class NugetMockHelper {
    private defaultNugetVersion = '3.3.0';
    private defaultNugetVersionInfo = [3,3,0,212];
    
    constructor(
        private tmr: tmrm.TaskMockRunner) { 
        process.env['AGENT_HOMEDIRECTORY'] = "c:\\agent\\home\\directory";
        process.env['BUILD_SOURCESDIRECTORY'] = "c:\\agent\\home\\directory\\sources",
        process.env['ENDPOINT_AUTH_SYSTEMVSSCONNECTION'] = "{\"parameters\":{\"AccessToken\":\"token\"},\"scheme\":\"OAuth\"}";
        process.env['ENDPOINT_URL_SYSTEMVSSCONNECTION'] = "https://example.visualstudio.com/defaultcollection";
        process.env['SYSTEM_DEFAULTWORKINGDIRECTORY'] = "c:\\agent\\home\\directory";
        process.env['SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'] = "https://example.visualstudio.com/defaultcollection";

        pkgMock.registerLocationHelpersMock(tmr);
    }
    
    public setNugetVersionInputDefault() {
        this.tmr.setInput('nuGetVersion', this.defaultNugetVersion);
    }
    
    public registerDefaultNugetVersionMock() {
        this.registerNugetVersionMock(this.defaultNugetVersion, this.defaultNugetVersionInfo);
    }
    
    public registerNugetVersionMock(productVersion: string, versionInfoVersion: number[]) {
        this.tmr.registerMock('../pe-parser', {
            getFileVersionInfoAsync: function(nuGetExePath) {
                let result: VersionInfo = { strings: {} };
                result.fileVersion = new VersionInfoVersion(versionInfoVersion[0], versionInfoVersion[1], versionInfoVersion[2], versionInfoVersion[3]);
                result.strings['ProductVersion'] = productVersion;
                return result;
            }
        })
    }
    
    public registerNugetUtilityMock(projectFile: string[]) {
        this.tmr.registerMock('packaging-common/nuget/Utility', {
            resolveFilterSpec: function(filterSpec, basePath?, allowEmptyMatch?) {
                return projectFile;
            },
            getBundledNuGetLocation: function(version) {
                return 'c:\\agent\\home\\directory\\externals\\nuget\\nuget.exe';
            },
            stripLeadingAndTrailingQuotes: function(path) {
                return path;
            },
            locateCredentialProvider: function(path) {
                return 'c:\\agent\\home\\directory\\externals\\nuget\\CredentialProvider';
            },
            setConsoleCodePage: function() {
                var tlm = require('vsts-task-lib/mock-task');
                tlm.debug(`setting console code page`);
            }
        } );
        
        this.tmr.registerMock('./Utility', {
            resolveToolPath: function(path) {
                return path;
            }
        });
    }
    
    public registerNugetConfigMock() {
        var nchm = require('./NuGetConfigHelper-mock');
        this.tmr.registerMock('packaging-common/nuget/NuGetConfigHelper', nchm);
    }
    
    public registerToolRunnerMock() {
        var mtt = require('vsts-task-lib/mock-toolrunner');
        this.tmr.registerMock('vsts-task-lib/toolrunner', mtt);
    }
    
    public setAnswers(a) {
        a.osType["osType"] = "Windows_NT";
        a.exist["c:\\agent\\home\\directory\\externals\\nuget\\nuget.exe"] = true;
        a.exist["c:\\agent\\home\\directory\\externals\\nuget\\CredentialProvider\\CredentialProvider.TeamBuild.exe"] = true;
        this.tmr.setAnswers(a);
    }
}