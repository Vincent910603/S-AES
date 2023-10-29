public class miyue {
    public static String[] syue(String mi){
        String[] mib = tans.Bytetobin(tans.parseHexStr2Byte(mi));
        String[] rcon = new String[]{"10000000","00110000"};
        String[] w = new String[6];
        w[0]=mib[0];w[1]=mib[1];
        w[2] = yh.huo(w[0],yh.huo(rcon[0],sr(w[1])));
        w[3] = yh.huo(w[2],w[1]);
        w[4] = yh.huo(w[2],yh.huo(rcon[1],sr(w[3])));
        w[5] = yh.huo(w[4],w[3]);
        return w;
    }

    private static String sr(String w){
        String l = w.substring(0,4);
        String r = w.substring(4,8);
        String temp = l;
        l=r;
        r=temp;
        l = box.Sshun(l);
        r = box.Sshun(r);
        temp = l+r;
        return temp;
    }
}
