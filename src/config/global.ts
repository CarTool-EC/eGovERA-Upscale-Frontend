import { GlobalConfig } from '@eui/core';

export const GLOBAL: GlobalConfig = {
    appTitle: 'eGovERA Upscale Frontend',
    i18n: {
        i18nService: {
            defaultLanguage: 'en',
            languages: [
                {
                    code: 'en',
                    label: 'English'
                },
                {
                    code: 'fr',
                    label: 'Français'
                }
            ],
        },
        i18nLoader: {
            i18nFolders: [
                'i18n-eui',
                'i18n',
                'i18n-ecl'
            ],
        },
    },
    user: {
        defaultUserPreferences: {
            dashboard: { },
            lang: 'en',
        },
    },
};
