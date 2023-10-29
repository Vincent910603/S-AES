import java.util.PropertyResourceBundle;

public class jjmi {
    public jjmi(){}

    public static String jiami(String ming,String mi){
        String[] my = miyue.syue(mi);
        String[] mingwen = tans.Bytetobin(tans.parseHexStr2Byte(ming));
        String miwen = "";
        for(int i =0 ;i<mingwen.length/2;i++){
            String mingw = mingwen[i]+mingwen[i+1];
            String mi1 = my[0]+my[1];
            String mi2 = my[2]+my[3];
            String mi3 = my[4]+my[5];
            mingw = myjia(mingw,mi1);
            mingw = bzjie(mingw);
            mingw = hwyi(mingw);
            mingw = lhxiao(mingw);
            mingw = myjia(mingw,mi2);
            mingw = bzjie(mingw);
            mingw = hwyi(mingw);
            mingw = myjia(mingw,mi3);
            miwen+=mingw;
        }
        String miwen1="";
        System.out.println(miwen);
        for(int i = 0;i<miwen.length()/4;i++){
            String a = miwen.substring(i,i+4);
            a=Integer.toHexString(Integer.parseInt(a,2));
            System.out.println(a);
            miwen1+=a;
        }
        return miwen1;
    }

    public static String jiemi(String mw,String mi){
        String[] my = miyue.syue(mi);
        String[] miwen = tans.Bytetobin(tans.parseHexStr2Byte(mw));
        String mingwen = "";
        for(int i =0 ;i<miwen.length/2;i++){
            String miw = miwen[i]+miwen[i+1];
            String mi1 = my[0]+my[1];
            String mi2 = my[2]+my[3];
            String mi3 = my[4]+my[5];
            miw = myjia(miw,mi3);
            miw = hwyi(miw);
            miw = nbzjie(miw);
            miw = myjia(miw,mi2);

        }
        return mingwen;
    }

    private static String myjia(String mingw,String mi){
        mingw = yh.huo(mingw, mi);
        return mingw;
    }

    private static String bzjie(String mingw){
        String s1 = mingw.substring(0,4);
        String s2 = mingw.substring(4,8);
        String s3 = mingw.substring(8,12);
        String s4 = mingw.substring(12,16);
        s1 = box.Sshun(s1);
        s2 = box.Sshun(s2);
        s3 = box.Sshun(s3);
        s4 = box.Sshun(s4);
        mingw = s1+s2+s3+s4;
        return mingw;
    }

    private static String nbzjie(String mingw){
        String s1 = mingw.substring(0,4);
        String s2 = mingw.substring(4,8);
        String s3 = mingw.substring(8,12);
        String s4 = mingw.substring(12,16);
        s1 = box.Sli(s1);
        s2 = box.Sli(s2);
        s3 = box.Sli(s3);
        s4 = box.Sli(s4);
        mingw = s1+s2+s3+s4;
        return mingw;
    }

    private static String hwyi(String mingw){
        String s1 = mingw.substring(0,4);
        String s2 = mingw.substring(4,8);
        String s3 = mingw.substring(8,12);
        String s4 = mingw.substring(12,16);
        String temp = s2;
        s2 = s4;
        s4 = temp;
        mingw = s1+s2+s3+s4;
        return mingw;
    }

    private static String lhxiao(String mingw){
        char[] c = mingw.toCharArray();
        String[] b = new String[c.length];
        for (int i=0;i<c.length;i++){
            b[i] = String.valueOf(c[i]);
        }
        String s1 = yh.huo(b[0],b[6])+yh.huo(b[1],yh.huo(b[4],b[7]))+yh.huo(b[2],yh.huo(b[4],b[5]))+yh.huo(b[3],b[5]);
        String s2 = yh.huo(b[2],b[4])+yh.huo(b[0],yh.huo(b[3],b[5]))+yh.huo(b[0],yh.huo(b[1],b[6]))+yh.huo(b[1],b[7]);
        String s3 = yh.huo(b[8],b[14])+yh.huo(b[9],yh.huo(b[12],b[15]))+yh.huo(b[10],yh.huo(b[12],b[13]))+yh.huo(b[11],b[13]);
        String s4 = yh.huo(b[10],b[12])+yh.huo(b[8],yh.huo(b[11],b[13]))+yh.huo(b[8],yh.huo(b[9],b[14]))+yh.huo(b[9],b[15]);
        mingw = s1+s2+s3+s4;
        return mingw;
    }
}
