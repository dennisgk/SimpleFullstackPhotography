#!/usr/bin/python

import sys, getopt
import shutil
from PIL import Image

def main(argv):
	inputfile = ''
	outputfile = ''
	try:
		opts, args = getopt.getopt(argv,"hi:o:",["ifile=","ofile="])
	except getopt.GetoptError:
		print('lowerPhotoRes.py -i <inputfile> -o <outputfile>')
		sys.exit(2)
	for opt, arg in opts:
		if opt == '-h':
			print('lowerPhotoRes.py -i <inputfile> -o <outputfile>')
			sys.exit()
		elif opt in ("-i", "--ifile"):
			inputfile = arg
		elif opt in ("-o", "--ofile"):
			outputfile = arg
	if(len(inputfile) < 1 or len(outputfile) < 1):
		sys.exit(2)
	image = Image.open(inputfile)
	imSize = image.size
	imX = imSize[0]
	imY = imSize[1]
	newImX = 0
	newImY = 0
	if(imX < 500 and imY < 500):
		shutil.copyfile(inputfile, outputfile)
		sys.exit(0)
	if(imX > imY):
		newImX = 500
		newImY = int(500 * (imY / imX))
	else:
		newImY = 500
		newImX = int(500 * (imX / imY))
	new_image = image.resize((newImX, newImY))
	new_image.save(outputfile)

if __name__ == "__main__":
   	main(sys.argv[1:])