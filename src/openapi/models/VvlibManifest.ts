/* tslint:disable */
/* eslint-disable */
/**
 * VOICEVOX Engine
 * VOICEVOX の音声合成エンジンです。
 *
 * The version of the OpenAPI document: latest
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * vvlib(VOICEVOX Library)に関する情報
 * @export
 * @interface VvlibManifest
 */
export interface VvlibManifest {
    /**
     * 
     * @type {string}
     * @memberof VvlibManifest
     */
    manifestVersion: string;
    /**
     * 
     * @type {string}
     * @memberof VvlibManifest
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof VvlibManifest
     */
    version: string;
    /**
     * 
     * @type {string}
     * @memberof VvlibManifest
     */
    uuid: string;
    /**
     * 
     * @type {string}
     * @memberof VvlibManifest
     */
    brandName: string;
    /**
     * 
     * @type {string}
     * @memberof VvlibManifest
     */
    engineName: string;
    /**
     * 
     * @type {string}
     * @memberof VvlibManifest
     */
    engineUuid: string;
}

/**
 * Check if a given object implements the VvlibManifest interface.
 */
export function instanceOfVvlibManifest(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "manifestVersion" in value;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "version" in value;
    isInstance = isInstance && "uuid" in value;
    isInstance = isInstance && "brandName" in value;
    isInstance = isInstance && "engineName" in value;
    isInstance = isInstance && "engineUuid" in value;

    return isInstance;
}

export function VvlibManifestFromJSON(json: any): VvlibManifest {
    return VvlibManifestFromJSONTyped(json, false);
}

export function VvlibManifestFromJSONTyped(json: any, ignoreDiscriminator: boolean): VvlibManifest {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'manifestVersion': json['manifest_version'],
        'name': json['name'],
        'version': json['version'],
        'uuid': json['uuid'],
        'brandName': json['brand_name'],
        'engineName': json['engine_name'],
        'engineUuid': json['engine_uuid'],
    };
}

export function VvlibManifestToJSON(value?: VvlibManifest | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'manifest_version': value.manifestVersion,
        'name': value.name,
        'version': value.version,
        'uuid': value.uuid,
        'brand_name': value.brandName,
        'engine_name': value.engineName,
        'engine_uuid': value.engineUuid,
    };
}

