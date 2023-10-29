public class box {
    public static String Sshun(String N){
        byte zhi = (byte)Integer.parseInt(N,2);
        byte[] s = new byte[]{9,4,10,11,13,1,8,5,6,2,0,3,12,14,15,7};
        for(int i = 0;i<16;i++){
            if(zhi == i){
                zhi=s[i];
                break;
            }
        }
        String result = Integer.toBinaryString(zhi);
        result = String.format("%4s", Integer.toBinaryString(zhi));
        result = result.replaceAll("\\s", "0");
        return result;
    }

    public static String Sli(String N){
        byte zhi = (byte)Integer.parseInt(N,2);
        byte[] s = new byte[]{10,5,9,11,1,7,8,15,6,0,2,3,12,4,13,14};
        for(int i = 0;i<16;i++){
            if(zhi == i){
                zhi=s[i];
                break;
            }
        }
        String result = Integer.toBinaryString(zhi);
        result = String.format("%4s", Integer.toBinaryString(zhi));
        result = result.replaceAll("\\s", "0");
        return result;
    }
}
