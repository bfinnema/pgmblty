
import sys, os, warnings, time, xmltodict, json
from ncclient import manager, operations, xml_

def default_unknown_host_cb(foo, bar):
    return True


def demo(host="10.101.0.18", port=830, user="cisco", password="Cisco123", operation_id=sys.argv[1]):
    filter_snippet="""
                        <ipsla xmlns="http://cisco.com/ns/yang/Cisco-IOS-XR-man-ipsla-oper">
                            <operation-data>
                            <operations>
                                <operation>
                                <statistics>
                                    <latest>
                                    <target>
                                        <common-stats>
                                            <ok-count/>
                                            <response-time/>
                                        </common-stats>
                                    </target>
                                    </latest>
                                </statistics>
                                <operation-id>""" + str(operation_id) + """</operation-id>
                                </operation>
                            </operations>
                            </operation-data>
                        </ipsla>
                    """
    #os.system('clear') 
    with manager.connect(host=host, port=port, username=user, password=password, unknown_host_cb=default_unknown_host_cb) as m:
        res=m.get(("subtree", filter_snippet))
        #print (xml_.to_xml(res.data_ele, pretty_print=True))
        result = xmltodict.parse(str(res.data_xml))
        #print (result)
        success_result = bool(int(result['data']['ipsla']['operation-data']['operations']['operation']['statistics']['latest']['target']['common-stats']['ok-count']))
        rtt = result['data']['ipsla']['operation-data']['operations']['operation']['statistics']['latest']['target']['common-stats']['response-time']
        #print("Success Result=%s" % success_result)
        #print("RTT=%s" % rtt)
        data = {
            "result": success_result,
            "rtt": rtt,
            "operation": operation_id
        }
        json_string = json.dumps(data)
        return json_string
        #return (success_result, rtt, operation_id, json_string)
        #return (bool(int(result['data']['ipsla']['operation-data']['operations']['operation']['statistics']['latest']['target']['common-stats']['ok-count'])),result['data']['ipsla']['operation-data']['operations']['operation']['statistics']['latest']['target']['common-stats']['response-time'] , operation_id)
        
if __name__ == '__main__':
    print(demo(operation_id=sys.argv[1]))