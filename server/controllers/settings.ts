import express from 'express';

import { Setting } from '../models';

import * as weboob from '../providers/weboob';
import getEmailer from '../lib/emailer';
import getNotifier, { sendTestNotification } from '../lib/notifications';
import { WEBOOB_NOT_INSTALLED } from '../shared/errors.json';

import { IdentifiedRequest } from './routes';

import {
    KError,
    asyncErr,
    setupTranslator,
    checkWeboobMinimalVersion,
    UNKNOWN_WEBOOB_VERSION,
} from '../helpers';

function postSave(userId: number, key: string, value: string) {
    switch (key) {
        case 'email-recipient': {
            const emailSender = getEmailer();
            if (emailSender !== null) {
                emailSender.forceReinit(value);
            }
            break;
        }
        case 'apprise-url': {
            const notifier = getNotifier(userId);
            if (notifier !== null) {
                notifier.forceReinit(value);
            }
            break;
        }
        case 'locale':
            setupTranslator(value);
            break;
        default:
            break;
    }
}

export async function save(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const pair = req.body;

        if (typeof pair.key === 'undefined') {
            throw new KError('Missing key when saving a setting', 400);
        }
        if (typeof pair.value === 'undefined') {
            throw new KError('Missing value when saving a setting', 400);
        }

        const userId = req.user.id;
        await Setting.updateByKey(userId, pair.key, pair.value);
        postSave(userId, pair.key, pair.value);

        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when saving a setting');
    }
}

export async function getWeboobVersion(_req: express.Request, res: express.Response) {
    try {
        const version = await weboob.getVersion(/* force = */ true);
        if (version === UNKNOWN_WEBOOB_VERSION) {
            throw new KError('cannot get weboob version', 500, WEBOOB_NOT_INSTALLED);
        }
        res.json({
            data: {
                version,
                isInstalled: checkWeboobMinimalVersion(version),
            },
        });
    } catch (err) {
        asyncErr(res, err, 'when getting weboob version');
    }
}

export async function updateWeboob(_req: express.Request, res: express.Response) {
    try {
        await weboob.updateWeboobModules();
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when updating weboob');
    }
}

export async function testEmail(req: express.Request, res: express.Response) {
    try {
        const { email } = req.body;
        if (!email) {
            throw new KError('Missing email recipient address when sending a test email', 400);
        }

        const emailer = getEmailer();
        if (emailer !== null) {
            await emailer.sendTestEmail(email);
        } else {
            throw new KError('No emailer found');
        }
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when trying to send an email');
    }
}

export async function testNotification(req: express.Request, res: express.Response) {
    try {
        const { appriseUrl } = req.body;
        if (!appriseUrl) {
            throw new KError('Missing apprise url when sending a notification', 400);
        }
        await sendTestNotification(appriseUrl);
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when trying to send a notification');
    }
}

export function isDemoForced(): boolean {
    return process.kresus.forceDemoMode === true;
}

export async function isDemoEnabled(userId: number): Promise<boolean> {
    return isDemoForced() || (await Setting.findOrCreateDefaultBooleanValue(userId, 'demo-mode'));
}
