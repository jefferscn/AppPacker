import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TextField, Checkbox, IconButton } from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import compose from 'recompose/compose';
import querystring from 'querystring';
import { TextInput } from 'admin-on-rest/lib/mui';
const plugins = [
    {
        url: 'phonegap-plugin-barcodescanner',
        name: 'phonegap-plugin-barcodescanner(条码/二维码扫描)',
    },
    {
        url: 'cordova-plugin-baidu-push',
        name: '百度推送(非官方)',
    },
    {
        url: 'jpush-phonegap-plugin',
        name: '极光推送',
        hasArgs: true,
        args: ['APP_KEY']
    },
    {
        url: 'cc.fovea.cordova.openwith',
        name: 'cc.fovea.cordova.openwith',
        hasArgs: true,
        args: ['ANDROID_MIME_TYPE',
            'IOS_URL_SCHEME',
            'IOS_UNIFORM_TYPE_IDENTIFIER',
            'SHAREEXT_PROVISIONING_PROFILE',
            'IOS_GROUP_IDENTIFIER',
            'SHAREEXT_DEVELOPMENT_TEAM']
    },
    {
        url: 'cordova-plugin-geolocation-baidu',
        name: 'cordova-plugin-geolocation-baidu(百度地图定位)',
        platform: 'ios',
        hasArgs: true,
        args: ['API_KEY']
    },
    {
        url: 'cordova-plugin-geoloaction-baidu-android',
        name: 'cordova-plugin-geoloaction-baidu-android(百度地图定位)',
        platform: 'android',
        hasArgs: true,
        args: ['API_KEY']
    },
    {
        url: 'phonegap-nfc',
        name: 'phonegap-nfc(NFC读写)',
        platform: 'android'
    }
];
const getPlatform = (url) => {
    var plugin = plugins.find(v => v && v.url == url);
    if (plugin) {
        return plugin.platform;
    }
    return undefined;
}
const getStyles = ({ palette: { accent1Color } }) => ({
    removeButtonHovered: {
        opacity: 1,
    },
    removeIcon: {
        color: accent1Color,
    },
});

class PluginArg extends PureComponent {
    onChange = (e, v) => {
        this.props.onChange && this.props.onChange(this.props.name, v);
    }
    render() {
        const { name, value } = this.props;
        return (
            <div>
                <TextField disabled defaultValue={name}></TextField>
                =
                <TextField defaultValue={value} onChange={this.onChange} ></TextField>
            </div>
        )
    }
}
/**
 * 渲染一个插件
 */
class Plugin extends PureComponent {
    state = {
        args: {}
    }
    onCheck = (event, checked) => {
        this.props.onChange(checked, this.props.meta, this.state.args);
    }
    onArgChange = (key, value) => {
        const v = {};
        v[key] = value;
        this.setState({
            args: Object.assign(this.state.args, v)
        })
        this.props.onChange(true, this.props.meta, this.state.args);
    }
    componentWillMount() {
        if (this.props.meta.hasArgs) {
            let args = {};
            if (this.props.value) {
                const arrValue = this.props.value.split('?');
                if (arrValue.length > 1) {
                    args = querystring.parse(arrValue[1]);
                }
                this.setState({
                    args,
                });
            } else {
                this.setState({
                    args,
                });
            }
        }
    }
    componentWillReceiveProps(props) {
        if (props.meta.hasArgs) {
            let args = {};
            if (props.value) {
                const arrValue = props.value.split('?');
                if (arrValue.length > 1) {
                    args = querystring.parse(arrValue[1]);
                }
                this.setState({
                    args,
                });
            } else {
                this.setState({
                    args,
                });
            }
        }
    }
    render() {
        const { meta, value } = this.props;
        return (
            <div>
                <Checkbox
                    label={meta.name}
                    checked={value}
                    onCheck={this.onCheck}
                />
                {
                    meta.hasArgs ?
                        <div>
                            {
                                meta.args.map((arg) => {
                                    return <PluginArg name={arg} value={this.state.args[arg]} onChange={this.onArgChange} />;
                                })
                            }
                        </div> : null
                }
            </div>
        )
    }
}

class PluginComponent extends PureComponent {
    // hasPlugin = (url) => {
    //     const { input: { value } } = this.props;
    //     const result = !value ? undefined : value.find((item) => {
    //         return item && item.url == url;
    //     });
    //     return result != undefined;
    // }
    getPluginValue = (url) => {
        const { input: { value } } = this.props;
        const result = !value ? undefined : value.find((item) => {
            return item && (item.url == url || item.url.startsWith(`${url}?`));
        });
        if (result) {
            return result.url;
        }
        return null;
    }
    handleCheck = (isChecked, meta, args) => {
        const { input: { value, onChange } } = this.props;
        let url = `${meta.url}`;
        if (meta.hasArgs) {
            url = `${url}?${querystring.stringify(args)}`;
        }
        const platform = meta.platform;
        if (isChecked) {
            const v = value.find((item) => {
                return item && (item.url == meta.url || item.url.startsWith(`${meta.url}?`));
            });
            if (v) {
                v.url = url;
                onChange(value);
            } else {
                onChange([...value, { url: url, platform: platform }]);
            }
        } else {
            onChange(value.filter(item => {
                return !(item.url === meta.url || item.url.startsWith(`${meta.url}?`));
            }));
        }
    }
    renderPlatForm = (platform) => {
        return plugins.map((item, index) => {
            return item.platform != platform ? null : (
                <Plugin meta={item} value={this.getPluginValue(item.url)} onChange={this.handleCheck} />);
        })
    }
    renderCustomPlugins = () => {
        //::TODO support Custom Plugins
        return null;
    }
    render() {
        return (
            <div>
                <p>
                    <div>通用插件</div>
                    {
                        this.renderPlatForm()
                    }
                </p>
                <p>
                    <div>Android插件</div>
                    {
                        this.renderPlatForm('android')
                    }
                </p>
                <p>
                    <div>IOS插件</div>
                    {
                        this.renderPlatForm('ios')
                    }
                </p>
                <p>
                    {
                        this.renderCustomPlugins()
                    }
                    {/* <TextInput  /> */}
                </p>
            </div>
        );
    }
}

PluginComponent.propTypes = {
    source: PropTypes.string,
    input: PropTypes.shape({
        onChange: PropTypes.func.isRequired,
    }),
};

PluginComponent.defaultProps = {
    addField: true
};

const enhance = compose(muiThemeable());

const PluginInput = enhance(PluginComponent);
PluginInput.propTypes = {
    addField: PropTypes.bool.isRequired,
};

PluginInput.defaultProps = {
    addField: true,
};

export default PluginInput;
