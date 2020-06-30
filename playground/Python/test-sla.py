
import sys, os, warnings, time, xmltodict
from ncclient import manager, operations, xml_


def default_unknown_host_cb(foo, bar):
    return True

def test_ipsla(host="10.101.0.18", port=830, user="cisco", password="Cisco123", operation_id="201"):
    print("HELLO WORLD, ", operation_id)
    # Gets IPSLA status directly from IOS XR router via Netconf interface
    filter_snippet ="""
                    <ipsla xmlns="http://cisco.com/ns/yang/Cisco-IOS-XR-man-ipsla-oper">
                        <operation-data>
                        <operations>
                            <operation>
                            <statistics>
                                <latest>
                                <target>
                                    <common-stats>
                                    <ok-count/>
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

    with manager.connect(host=host, port=port, username=user, password=password, unknown_host_cb=default_unknown_host_cb) as m:
        res=m.get(("subtree", filter_snippet))
        result = xmltodict.parse(str(res.data_xml))
        return (bool(int(result['data']['ipsla']['operation-data']['operations']['operation']['statistics']['latest']['target']['common-stats']['ok-count'])))

if __name__ == '__main__':
    # os.system('clear') 
    res = test_ipsla(operation_id=202)
    print("")
    print(res)
    print("")
    print("")
    print("")
