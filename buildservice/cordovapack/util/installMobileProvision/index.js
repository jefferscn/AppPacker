import mp from 'mobileprovision';
import fs from 'fs-extra-promise';
import download from '../download';

async function installMobileProvision(mpUrl, filename) {
    const file = filename || 'temp.mobileprovision';
    try{
        await download(mpUrl, file);
        const value = await mp(file);
        return value;
    }finally{
        await fs.remove(file);
    }
}

export default installMobileProvision;
