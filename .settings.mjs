export default

    {
        mail: {
            OutlookUser: "borkert@hotmail.com",
            OutlookPass: "apitgdoestkhatah",
            SMSEmailDomain: "tmomail.net",
        },

        eBay: {
            debug: true,
            keywords: 'iPhone 13',
            minPrice: '600',
            maxPrice: '700',
            condition_rx: /pack|cas|FOR PARTS/i,
            title_rx: /pack|cas|BROKEN/i,
            limit: 10,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer v^1.1#i^1#I^3#r^0#f^0#p^1#t^H4sIAAAAAAAAAOVYW2wUVRjutNtiLRclxmoxskxRQs3OnLktu5Pumu0Fd0tvdLctNkEyM3umHTo7M5mZ7Xa9xNpIRU0IGowPEtNAQIzxQUAeiDyIBKI+CESFKOKDMaCoD0UtIomemV3KthJAuolN3GSzO//5z3++7zv/fy4DRioq68aiY5MLsHml4yNgpBTDqCpQWVH+yMKy0pryElDggI2PLB/xjJadr7eElGrwXdAydM2C3uGUqlm8awzhaVPjdcFSLF4TUtDibYmPR9paeZoAvGHqti7pKu6NNYXwJJQCgOYCQT/HQsD5kVW7GjOhh3A6wMhBWgYyR3OiSAdQu2WlYUyzbEGzUTugKR8FfHQwAWge+HmOJRjA9uHeHmhaiq4hFwLgYRcu7/Y1C7DeGKpgWdC0URA8HIusjndEYk3N7Yl6siBWOK9D3BbstDX9qVFPQm+PoKbhjYexXG8+npYkaFk4Gc6NMD0oH7kK5jbgu1JDOUAhqRmakRkOsKAoUq7WzZRg3xiHY1GSPtl15aFmK3b2ZooiNcSNULLzT+0oRKzJ6/ysTQuqIivQDOHNDZHHI52deLhxwFSsBt30Tf3p7GrycTQU/SL6+lYxqwIySCbzA+Wi5WWeMVKjriUVRzTL267bDRChhtO1oXiuQBvk1KF1mBHZdhAV+rFTGoI+Z1Jzs5i2BzRnXmEKCeF1H28+A1O9bdtUxLQNpyLMbHAlCuGCYShJfGajm4v59Bm2QviAbRs8SWYyGSLDELrZT9IAUOS6tta4NABTAo58nVrP+Ss37+BTXCoSRD0thbezBsIyjHIVAdD68TBLsSzH5XWfDis80/oPQwFncnpFFKtCKIYTZChxAVqi2aBIFaNCwvkkJR0cUBSyvpRgDkLbUAUJ+iSUZ+kUNJUkz3AyzQRk6Ev6g7KPDcqyT+SSfh8lQwggFEUpGPg/FcqtpnocSia0i5LrRcvzISEicRE1GuuVW9o6e5sjoB8ywWxrxp9Yp/uH+iPrhgy2q689DjKhW62G65JvVBWkTAKNXwwBnFovnghR3bJhclb04pJuwE5dVaTs3Jpgxkx2CqadjUNVRYZZkYwYRqw4a3XR6P3LZeL2eBdvj/qP9qfrsrKclJ1brJz+FgogGArh7ECEpKdIp9Z1AR0/HPMGF/WseCvo5DqnWCOSObZKMnfkJFy6hDUkESa09LSJTttEh3MCS+iDUEP7mW3qqgrNHmrW9ZxKpW1BVOFcK+wiJLgizLHNlvIzHLuKoSl2VrwkdyvdMNeWpGIsxZ7HbvNYTU6/5IdL3A81ir0PRrH3SjEMkOAhqhYsqyjr9pTNr7EUGxKKIBOW0q+hu6sJiUGYNQTFLK3AMtUHdx0qeK0wvh7cN/ViobKMqip4ywAeuNZSTi2qXkBT6O4aBDTwc2wfqL3W6qHu9dzT+umH4cqxv9ZeeW5Pw7mH52XIb8tOgwVTThhWXuIZxUqySzwAViXg+mOe/Wd//ua4UjOP7nvh+5OY+LznrSrMPA8nxB0v1f32xcpNNRVjVKDqFN79icicfH37CvG4fPdu4dilLU37LxpvrBj5suPo/M27t12+WOvfd/BBonKlp+fwx6dqF1Z3CVXbvjq7Hb9r46nX7nzxbWPv0r3g1zUvr1285MCZ9qN8y/Iff4/WHWlY8+qFS+PLLsi/3G//QB8MnJ74aOnmPl3sPWEcOLfo+OrIK5uj6RMtvU9NHG7oPjO45U3PE5/3bv3MmFy0Z+fi4eYP7mjZ1TZBRt8deufcZPefGbKr9vKhn+r21f9xha9+esfX/He15pGK6KOl9TubLlyJP3vkmScnV0qbctP3N5g9fKrwEQAA' 
            }
        },

        Mercari: {
            debug: true,
            keywords: "iphone 13",
            minPrice: "600",
            maxPrice: "800",
            condition_rx: /FOR PARTS/i,
            title_rx: /BROKEN/i,
            limit: 5,
            headers: {}
        }

    }