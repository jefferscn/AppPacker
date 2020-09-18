import { ProjectSchema, TaskSchema, Project } from '../ui/model';
import baseUrl from './baseUrl';
async function checkUpdate(req, res) {
    const projectId = req.params.projectId;
    const result = {};
    result.projectId = projectId;
    // const project = await Project.findById(projectId);
    const project = await Project.findOne({
        appId: projectId,
    });
    if (!project) {
        res.state(404).end();
        return;
    }
    console.log(project.lastRelease);
    if (project.lastRelease) {
        if (project.lastRelease.android && project.lastRelease.android.version) {
            result.android = {};
            result.android.Version = project.lastRelease.android.version;
            result.android.Url =`${baseUrl}${project.lastRelease.android.url}`;
            result.android.Link = `${baseUrl}#/tasks/${project.lastRelease.android.taskId}/show`;
            result.android.UpdateTime = project.lastRelease.android.releaseDate;
        }
        if (project.lastRelease.ios && project.lastRelease.ios.version) {
            result.ios = {};
            result.ios.Url =`${baseUrl}${project.lastRelease.ios.url}`;
            result.ios.Url = 'itms-services://?action=download-manifest&amp;url=' + encodeURIComponent(result.ios.Url);
            result.ios.Version = project.lastRelease.ios.version;
            result.ios.Link = `${baseUrl}#/tasks/${project.lastRelease.ios.taskId}/show`;
            result.ios.UpdateTime = project.lastRelease.ios.releaseDate;
        }
    }
    res.json(result).end();
}
export default (app) => {
    app.get('/checkupdate/:projectId', checkUpdate);
}